const Resource = require('../models/Resource');

/**
 * Call the official Google Gemini API (gemini-2.5-flash) if the API key is configured.
 * Otherwise, returns null to trigger local fallback.
 */
const callGemini = async (prompt, systemInstruction = "") => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'your_gemini_api_key_here') {
    return null;
  }

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: [{ text: prompt }]
          }
        ],
        systemInstruction: systemInstruction ? {
          parts: [{ text: systemInstruction }]
        } : undefined,
        generationConfig: {
          temperature: 0.7,
        }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Gemini API error: ${response.status} - ${errorText}`);
      return null;
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    return text || null;
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    return null;
  }
};

/**
 * Dynamically extract keywords or sentences to build a fallback note summary.
 */
const getMockNoteSummary = (title, content) => {
  if (!content || content.trim().length === 0) {
    return `### Note Summary: **${title}**\n\nThis note is empty! Please write some details first to get an AI summary.`;
  }

  const cleanContent = content.replace(/[#*`[\]]/g, '').trim();
  const sentences = cleanContent.split(/[.!?]+/).map(s => s.trim()).filter(s => s.length > 5);
  const words = cleanContent.split(/\s+/).map(w => w.toLowerCase().replace(/[^a-z]/g, '')).filter(w => w.length > 4);

  // Get unique keywords (top words by frequency/length)
  const uniqueWords = [...new Set(words)].slice(0, 5);

  const summaryOverview = sentences.slice(0, 2).join('. ') + '.';
  const keyPoints = sentences.slice(2, 6).map(s => `- ${s}`).join('\n') || '- Contains core study concepts and notes.\n- Review frequently to retain details.';

  return `### AI Summary for **${title}**
*Generated via Study Vault Assistant*

#### 📝 Overview
${summaryOverview}

#### 🔑 Key Takeaways
${keyPoints}

#### 💡 Study Recommendations
- Use **spaced repetition** to review this note.
- Focus on these key terms: ${uniqueWords.map(w => `\`${w}\``).join(', ') || 'N/A'}.
`;
};

/**
 * Dynamically explain terms based on bolding or code blocks, fallback to parsing main words.
 */
const getMockTerms = (title, content) => {
  if (!content || content.trim().length === 0) {
    return `No terms found to explain. Add some text to your note first!`;
  }

  // Find backticked words or bolded words
  const terms = [];
  const backtickMatches = content.match(/`([^`]+)`/g);
  const boldMatches = content.match(/\*\*([^*]+)\*\*/g);

  if (backtickMatches) {
    backtickMatches.forEach(m => terms.push(m.replace(/`/g, '')));
  }
  if (boldMatches) {
    boldMatches.forEach(m => terms.push(m.replace(/\*\*/g, '')));
  }

  // Clean and unique
  let uniqueTerms = [...new Set(terms)].map(t => t.trim()).filter(t => t.length > 2 && t.length < 30);

  if (uniqueTerms.length === 0) {
    // extract some capitalized words
    const capWords = content.match(/\b[A-Z][a-z]{3,}\b/g) || [];
    uniqueTerms = [...new Set(capWords)].slice(0, 3);
  }

  if (uniqueTerms.length === 0) {
    uniqueTerms = [title, "Study Technique"];
  }

  let response = `### 📖 Explanations of Key Terms in **${title}**\n\n`;
  uniqueTerms.forEach(term => {
    response += `#### 📌 \`${term}\`\n`;
    response += `- **Context in Note**: Found in your study resource on "${title}".\n`;
    response += `- **Definition**: A core concept in this subject field. In the context of your notes, this refers to a key building block or variable that is essential to master. Make sure to test your recall on how this term connects with the rest of your topics.\n\n`;
  });

  return response;
};

/**
 * Generate a list of study cards or mock quiz questions.
 */
const getMockQuiz = (title, content) => {
  if (!content || content.trim().length === 0) {
    return `Add content to generate a study quiz.`;
  }

  const cleanContent = content.replace(/[#*`[\]]/g, '').trim();
  const sentences = cleanContent.split(/[.!?]+/).map(s => s.trim()).filter(s => s.length > 10);

  let response = `### 🧠 AI Practice Quiz: **${title}**\n\n`;

  if (sentences.length < 2) {
    response += `#### Q1: What is the main objective of studying "${title}"?\n`;
    response += `* **Answer**: To build structural knowledge and recall key facts defined inside this study block.\n\n`;
    response += `#### Q2: How does "${title}" connect to your broader learning goals?\n`;
    response += `* **Answer**: It represents an essential milestone folder of knowledge in your second brain dashboard.\n`;
  } else {
    const q1 = sentences[0];
    const q2 = sentences[Math.min(1, sentences.length - 1)];
    const q3 = sentences[Math.min(2, sentences.length - 1)];

    response += `#### Q1: According to your notes, what is the significance of the statement: "*${q1}*"?\n`;
    response += `* **Answer**: This outlines the introductory context and core definition of this topic. Review this to form a solid mental model.\n\n`;

    response += `#### Q2: Clarify the concept related to: "*${q2}*"?\n`;
    response += `* **Answer**: This details the second level of understanding or process step in your notes. Test your active recall here.\n\n`;

    if (sentences.length > 2) {
      response += `#### Q3: Explain how the following fact operates: "*${q3}*"?\n`;
      response += `* **Answer**: This is a key technical detail or supporting argument in your note. Linking this with other facts will solidify your memory.\n`;
    }
  }

  return response;
};

/**
 * Smart doubt solver: search for matching words and extract context.
 */
const getMockDoubtReply = (question, title, content) => {
  if (!content || content.trim().length === 0) {
    return `Your note is empty. Please add details first so I can answer your questions based on them!`;
  }

  const cleanQuestion = question.toLowerCase();
  const paragraphs = content.split(/\n+/).map(p => p.trim()).filter(p => p.length > 10);

  // Find paragraph with highest word match
  let bestParagraph = "";
  let maxMatches = 0;

  const queryWords = cleanQuestion.split(/\s+/).filter(w => w.length > 3);

  paragraphs.forEach(p => {
    let matches = 0;
    const lowerP = p.toLowerCase();
    queryWords.forEach(qw => {
      if (lowerP.includes(qw)) matches++;
    });

    if (matches > maxMatches) {
      maxMatches = matches;
      bestParagraph = p;
    }
  });

  let answer = "";
  if (maxMatches > 0) {
    answer = `Based on your note **"${title}"**, here is the relevant section:\n\n> ${bestParagraph}\n\n**AI Explanation**: This section indicates how the terms connect. When you ask *"${question}"*, this reference shows the direct relationship. Make sure to review this specific part in your notes for your tests!`;
  } else {
    // General response summarizing note context
    const snippet = content.substring(0, Math.min(200, content.length)) + "...";
    answer = `I scanned your note **"${title}"** for details regarding *"${question}"*. While I couldn't find a direct exact match, here is the context from the beginning of your notes:\n\n> ${snippet}\n\nTo clear your doubt, check if you need to add details about this question into your note, or ask a question related to existing terms in your note like: ${title}.`;
  }

  return answer;
};

/**
 * Subject Optimizer Mock
 */
const getMockSubjectOptimization = async (subject, resources) => {
  if (resources.length === 0) {
    return `### AI Subject Optimization: **${subject.name}**\n\nNo notes found in this subject folder yet! Add notes to trigger the optimizer.`;
  }

  // Find weaknesses (mastery level <= 2)
  const weakNotes = resources.filter(r => r.masteryLevel <= 2);
  // Find overdue reviews (lastReviewed is oldest)
  const sortedByReview = [...resources].sort((a, b) => new Date(a.lastReviewed) - new Date(b.lastReviewed));
  const oldestReviewed = sortedByReview[0];

  let weaknessReport = "";
  if (weakNotes.length > 0) {
    weaknessReport = weakNotes.map(n => `- **${n.title}** (Mastery Level: Lvl ${n.masteryLevel}) — *Needs active recall practice. Try generating a quiz on this note.*`).join('\n');
  } else {
    weaknessReport = `- *All topics are at high mastery levels (Lvl 3+). Great job!*`;
  }

  // Generate subject overview
  const noteList = resources.map(r => `* **${r.title}** (Lvl ${r.masteryLevel}, Reviewed: ${new Date(r.lastReviewed).toLocaleDateString()})`).join('\n');

  // Multi-note practice quiz questions
  let practiceQuestions = "";
  if (resources.length >= 2) {
    practiceQuestions = `#### 🧪 Cross-Topic Quiz Questions:\n`;
    practiceQuestions += `1. How does the concept of **${resources[0].title}** compare or relate to **${resources[1].title}**?\n`;
    if (resources.length >= 3) {
      practiceQuestions += `2. Formulate a summary combining **${resources[1].title}** and **${resources[2].title}**.\n`;
    }
  } else {
    practiceQuestions = `*Add at least 2 notes to this subject folder to generate cross-topic review questions.*`;
  }

  return `### ⚡ AI Subject Optimizer for **${subject.name}**
*Optimizing ${resources.length} folders & topics*

#### 📊 Folder Health Summary
Here are the current topics in this subject folder:
${noteList}

#### ⚠️ Weak Spot Analyzer (Needs Revision)
Based on mastery level and spacing intervals, prioritize these first:
${weaknessReport}
${oldestReviewed ? `- **${oldestReviewed.title}** has the oldest review date (${new Date(oldestReviewed.lastReviewed).toLocaleDateString()}). Schedule a quick review session today!` : ''}

#### 🎯 Recommended Action Plan
1. **Active Review**: Dedicate 15 minutes to review the weak notes listed above.
2. **Increase Streak**: Edit and review **${oldestReviewed ? oldestReviewed.title : resources[0].title}** to bump up its mastery level.
3. **Solve Practice Problems**: Use the cross-topic questions below to verify your mental links.

${practiceQuestions}
`;
};

module.exports = {
  callGemini,
  getMockNoteSummary,
  getMockTerms,
  getMockQuiz,
  getMockDoubtReply,
  getMockSubjectOptimization
};
