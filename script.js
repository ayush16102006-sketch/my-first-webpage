// Statistics tracking
const stats = {
    positive: 0,
    neutral: 0,
    negative: 0
};

// History array
const history = [];

/**
 * Main sentiment analysis function
 * Validates input and triggers analysis
 */
function analyzeSentiment() {
    const text = document.getElementById('textInput').value.trim();
    
    if (!text) {
        alert('Please enter some text to analyze!');
        return;
    }

    // Show loading state
    document.getElementById('loading').classList.add('active');
    document.getElementById('emptyState').style.display = 'none';
    document.getElementById('resultContainer').classList.remove('active');

    // Simulate API delay for realistic feel
    setTimeout(() => {
        const result = performSentimentAnalysis(text);
        displayResults(result, text);
        
        // Hide loading, show results
        document.getElementById('loading').classList.remove('active');
        document.getElementById('resultContainer').classList.add('active');
    }, 800);
}

/**
 * Core sentiment analysis algorithm
 * @param {string} text - Text to analyze
 * @returns {object} Analysis results with sentiment, scores, and confidence
 */
function performSentimentAnalysis(text) {
    const lowerText = text.toLowerCase();
    
    // Positive keywords
    const positiveWords = [
        'good', 'great', 'excellent', 'amazing', 'wonderful', 'fantastic', 
        'love', 'best', 'perfect', 'awesome', 'brilliant', 'outstanding', 
        'superb', 'incredible', 'beautiful', 'happy', 'delighted', 
        'satisfied', 'pleased', 'recommend', 'impressive'
    ];
    
    // Negative keywords
    const negativeWords = [
        'bad', 'terrible', 'awful', 'horrible', 'worst', 'hate', 
        'disappointing', 'poor', 'useless', 'waste', 'never', 'not', 
        'disappointed', 'angry', 'frustrated', 'sad', 'unfortunate', 
        'regret', 'inferior', 'pathetic', 'unacceptable'
    ];
    
    // Neutral keywords
    const neutralWords = [
        'okay', 'fine', 'average', 'normal', 'standard', 'acceptable', 'decent'
    ];

    let positiveScore = 0;
    let negativeScore = 0;
    let neutralScore = 0;

    // Count keyword matches
    positiveWords.forEach(word => {
        const regex = new RegExp('\\b' + word + '\\b', 'gi');
        const matches = lowerText.match(regex);
        if (matches) positiveScore += matches.length;
    });

    negativeWords.forEach(word => {
        const regex = new RegExp('\\b' + word + '\\b', 'gi');
        const matches = lowerText.match(regex);
        if (matches) negativeScore += matches.length;
    });

    neutralWords.forEach(word => {
        const regex = new RegExp('\\b' + word + '\\b', 'gi');
        const matches = lowerText.match(regex);
        if (matches) neutralScore += matches.length;
    });

    // Check for intensifiers
    if (lowerText.includes('very') || lowerText.includes('extremely') || lowerText.includes('absolutely')) {
        if (positiveScore > negativeScore) positiveScore *= 1.5;
        if (negativeScore > positiveScore) negativeScore *= 1.5;
    }

    // Check for exclamation marks (usually indicate strong emotion)
    const exclamations = (text.match(/!/g) || []).length;
    if (exclamations > 0) {
        if (positiveScore > negativeScore) positiveScore += exclamations * 0.5;
        if (negativeScore > positiveScore) negativeScore += exclamations * 0.5;
    }

    // Calculate total
    const total = positiveScore + negativeScore + neutralScore;
    
    if (total === 0) {
        // Default to neutral if no keywords found
        return {
            sentiment: 'neutral',
            scores: {
                positive: 33,
                neutral: 34,
                negative: 33
            },
            confidence: 50
        };
    }

    // Calculate percentages
    const posPercent = Math.round((positiveScore / total) * 100);
    const negPercent = Math.round((negativeScore / total) * 100);
    const neuPercent = 100 - posPercent - negPercent;

    // Determine sentiment
    let sentiment;
    let confidence;
    
    if (posPercent > negPercent && posPercent > neuPercent) {
        sentiment = 'positive';
        confidence = Math.min(posPercent + 20, 99);
    } else if (negPercent > posPercent && negPercent > neuPercent) {
        sentiment = 'negative';
        confidence = Math.min(negPercent + 20, 99);
    } else {
        sentiment = 'neutral';
        confidence = Math.min(Math.max(neuPercent, posPercent, negPercent) + 15, 99);
    }

    return {
        sentiment,
        scores: {
            positive: posPercent,
            neutral: neuPercent,
            negative: negPercent
        },
        confidence
    };
}

/**
 * Display analysis results in the UI
 * @param {object} result - Analysis results
 * @param {string} text - Original text
 */
function displayResults(result, text) {
    const display = document.getElementById('sentimentDisplay');
    const emoji = document.getElementById('sentimentEmoji');
    const label = document.getElementById('sentimentLabel');
    const confidence = document.getElementById('sentimentConfidence');

    // Update sentiment display
    display.className = 'sentiment-display ' + result.sentiment;
    
    const emojis = {
        positive: '😊',
        neutral: '😐',
        negative: '😞'
    };
    
    emoji.textContent = emojis[result.sentiment];
    label.textContent = result.sentiment.toUpperCase();
    confidence.textContent = `Confidence: ${result.confidence}%`;

    // Update scores
    document.getElementById('positiveScore').textContent = result.scores.positive + '%';
    document.getElementById('neutralScore').textContent = result.scores.neutral + '%';
    document.getElementById('negativeScore').textContent = result.scores.negative + '%';

    // Animate progress bars
    setTimeout(() => {
        document.getElementById('positiveBar').style.width = result.scores.positive + '%';
        document.getElementById('neutralBar').style.width = result.scores.neutral + '%';
        document.getElementById('negativeBar').style.width = result.scores.negative + '%';
    }, 100);

    // Update stats
    stats[result.sentiment]++;
    updateStats();

    // Add to history
    addToHistory(text, result);
}

/**
 * Update statistics display
 */
function updateStats() {
    document.getElementById('totalPositive').textContent = stats.positive;
    document.getElementById('totalNeutral').textContent = stats.neutral;
    document.getElementById('totalNegative').textContent = stats.negative;
}

/**
 * Add analysis to history
 * @param {string} text - Analyzed text
 * @param {object} result - Analysis results
 */
function addToHistory(text, result) {
    const now = new Date();
    const timeStr = now.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit' 
    });
    
    history.unshift({
        text,
        sentiment: result.sentiment,
        time: timeStr,
        confidence: result.confidence
    });

    // Keep only last 10 items
    if (history.length > 10) history.pop();

    renderHistory();
}

/**
 * Render history list
 */
function renderHistory() {
    const historyList = document.getElementById('historyList');
    
    if (history.length === 0) {
        historyList.innerHTML = `
            <div style="text-align: center; padding: 2rem; color: var(--text-muted);">
                No analysis history yet
            </div>
        `;
        return;
    }

    historyList.innerHTML = history.map(item => `
        <div class="history-item ${item.sentiment}">
            <div class="history-header">
                <span class="history-sentiment">${item.sentiment} (${item.confidence}%)</span>
                <span class="history-time">${item.time}</span>
            </div>
            <div class="history-text">${item.text}</div>
        </div>
    `).join('');
}

/**
 * Clear input textarea
 */
function clearInput() {
    document.getElementById('textInput').value = '';
    document.getElementById('textInput').focus();
}

// Sample texts for demo (optional)
const sampleTexts = [
    "This is absolutely amazing! I love it so much! Best purchase ever!",
    "It's okay, nothing special. Does what it's supposed to do.",
    "Terrible experience. Would not recommend to anyone. Very disappointed."
];