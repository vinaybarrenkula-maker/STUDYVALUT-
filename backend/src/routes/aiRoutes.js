const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/auth');
const Resource = require('../models/Resource');
const Subject = require('../models/Subject');
const {
  callGemini,
  getMockNoteSummary,
  getMockTerms,
  getMockQuiz,
  getMockDoubtReply,
  getMockSubjectOptimization
} = require('../utils/gemini');

// Existing simple assistant chat
// POST /api/ai/chat
router.post('/chat', verifyToken, async (req, res) => {
  try {
    const { message, context } = req.body;
    
    // Call Gemini if configured, otherwise fall back to simple rules
    let responseText = await callGemini(
      `User asks: "${message}"\nContext: ${context || 'None'}`,
      "You are a helpful study assistant for Study Vault, an app that manages notes, code snippets, links, and study tasks. Help the user organize knowledge, solve doubts, and suggest study tips."
    );

    if (!responseText) {
      const msg = message.toLowerCase();
      if (msg.includes('how to study')) {
        responseText = "The best way to study is using active recall and spaced repetition. Your Study Vault 'Daily Focus' is already designed to help you with this!";
      } else if (msg.includes('mastery')) {
        responseText = "Mastery levels 1-5 track how well you know a topic. Try to review Level 1 items more frequently until they reach Level 5.";
      } else if (msg.includes('markdown')) {
        responseText = "You can use Markdown in your notes! Try # for headings, ** for bold, and ` for code blocks.";
      } else {
        responseText = `I'm your Study Vault AI. You asked: "${message}". I'm here to help you organize your knowledge and clarify concepts in your notes.`;
      }
    }

    res.json({
      success: true,
      reply: responseText,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/ai/summarize-note
router.post('/summarize-note', verifyToken, async (req, res) => {
  try {
    const { resourceId } = req.body;
    const resource = await Resource.findOne({ _id: resourceId, userId: req.user._id });
    if (!resource) {
      return res.status(404).json({ success: false, message: 'Resource not found' });
    }

    const prompt = `Summarize the following study note titled "${resource.title}" with key takeaways, bullet points, and study recommendations:\n\n${resource.content}`;
    const systemInstruction = "You are an expert academic tutor. Summarize notes cleanly in Markdown format. Do not write generic chat introductions; go straight into the summary.";
    
    let summary = await callGemini(prompt, systemInstruction);
    if (!summary) {
      summary = getMockNoteSummary(resource.title, resource.content);
    }

    res.json({ success: true, summary });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/ai/explain-terms
router.post('/explain-terms', verifyToken, async (req, res) => {
  try {
    const { resourceId } = req.body;
    const resource = await Resource.findOne({ _id: resourceId, userId: req.user._id });
    if (!resource) {
      return res.status(404).json({ success: false, message: 'Resource not found' });
    }

    const prompt = `Analyze the following note content titled "${resource.title}" and extract any complex technical terms or jargon. Provide clean, concise, dictionary-style definitions for each in Markdown:\n\n${resource.content}`;
    const systemInstruction = "You are an expert academic glossary writer. Extract 3-6 terms and explain them clearly using Markdown lists.";
    
    let terms = await callGemini(prompt, systemInstruction);
    if (!terms) {
      terms = getMockTerms(resource.title, resource.content);
    }

    res.json({ success: true, terms });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/ai/generate-quiz
router.post('/generate-quiz', verifyToken, async (req, res) => {
  try {
    const { resourceId } = req.body;
    const resource = await Resource.findOne({ _id: resourceId, userId: req.user._id });
    if (!resource) {
      return res.status(404).json({ success: false, message: 'Resource not found' });
    }

    const prompt = `Generate a practice quiz / Q&A flashcards (with questions and answers hidden or listed below) based on the following study note titled "${resource.title}" to test active recall:\n\n${resource.content}`;
    const systemInstruction = "You are an AI learning coach. Create 3-5 engaging review questions and answers based on the note in clean Markdown format.";
    
    let quiz = await callGemini(prompt, systemInstruction);
    if (!quiz) {
      quiz = getMockQuiz(resource.title, resource.content);
    }

    res.json({ success: true, quiz });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/ai/ask-note-doubt
router.post('/ask-note-doubt', verifyToken, async (req, res) => {
  try {
    const { resourceId, question } = req.body;
    const resource = await Resource.findOne({ _id: resourceId, userId: req.user._id });
    if (!resource) {
      return res.status(404).json({ success: false, message: 'Resource not found' });
    }

    const prompt = `The user has a question/doubt about the following study note.\n\nNote Title: ${resource.title}\nNote Content:\n${resource.content}\n\nUser Question: ${question}\n\nAnswer the question accurately using the context of the note. If the answer is not in the note, use your general knowledge but clearly state that it extends beyond the note content. Keep the tone encouraging and academic.`;
    
    let reply = await callGemini(prompt, "You are a friendly AI study assistant. Help the user clear their doubt based on their notes.");
    if (!reply) {
      reply = getMockDoubtReply(question, resource.title, resource.content);
    }

    res.json({ success: true, reply });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/ai/optimize-subject
router.post('/optimize-subject', verifyToken, async (req, res) => {
  try {
    const { subjectId, action, question } = req.body;
    
    const subject = await Subject.findOne({ _id: subjectId, userId: req.user._id });
    if (!subject) {
      return res.status(404).json({ success: false, message: 'Subject not found' });
    }

    const resources = await Resource.find({ subjectId, userId: req.user._id });
    if (resources.length === 0) {
      return res.json({ 
        success: true, 
        analysis: `No notes found in this subject folder yet! Add some notes first to enable optimization.`,
        reply: `No notes found in this subject folder yet! Add some notes first to enable optimization.`
      });
    }

    if (action === 'chat') {
      if (!question) {
        return res.status(400).json({ success: false, message: 'Question is required for chat action' });
      }
      const notesContext = resources.map(r => `Title: ${r.title}\nContent:\n${r.content}`).join('\n\n---\n\n');
      const prompt = `You are an AI study assistant for the subject folder "${subject.name}".\nHere are all the notes inside this subject folder:\n\n${notesContext}\n\nUser Question: "${question}"\n\nAnswer the user's question clearly, referencing specific notes where appropriate.`;
      
      let reply = await callGemini(prompt, `You are a helpful academic tutor. Answer doubts using the subject's note folder content.`);
      if (!reply) {
        reply = getMockDoubtReply(question, `Subject Folder: ${subject.name}`, resources.map(r => r.content).join('\n\n'));
      }
      return res.json({ success: true, reply });
    }

    if (action === 'quiz') {
      const notesContext = resources.map(r => `Title: ${r.title}\nContent:\n${r.content}`).join('\n\n---\n\n');
      const prompt = `Generate a cross-topic practice quiz (with answers) based on the following notes in the "${subject.name}" subject folder:\n\n${notesContext}`;
      
      let quiz = await callGemini(prompt, "You are a test generator. Create a comprehensive multi-topic review quiz from the notes provided.");
      if (!quiz) {
        quiz = getMockQuiz(subject.name, resources.map(r => `## ${r.title}\n${r.content}`).join('\n\n'));
      }
      return res.json({ success: true, quiz });
    }

    // Default action: 'analyze' / 'optimize'
    const notesContext = resources.map(r => `Title: ${r.title}\nContent Summary: ${r.content.substring(0, 150)}...\nMastery Level: ${r.masteryLevel}\nRevision Count: ${r.revisionCount}\nLast Reviewed: ${r.lastReviewed}`).join('\n\n');
    
    const prompt = `Analyze the following list of study notes in the subject folder "${subject.name}":\n\n${notesContext}\n\nProvide a high-level subject overview, identify weak spots (such as notes with low mastery levels or neglected review dates), and recommend a specific, actionable study plan to optimize study time.`;
    const systemInstruction = "You are a learning optimization coach. Provide an encouraging, data-backed analysis of the user's study topics and suggest a clear study plan.";

    let analysis = await callGemini(prompt, systemInstruction);
    if (!analysis) {
      analysis = await getMockSubjectOptimization(subject, resources);
    }

    res.json({ success: true, analysis });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
