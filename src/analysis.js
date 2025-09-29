/**
 * [TODO] Step 0: Import the dependencies, fs and papaparse
 */
const fs = require('fs');
const Papa = require('papaparse');

/**
 * [TODO] Step 1: Parse the Data
 *      Parse the data contained in a given file into a JavaScript objectusing the modules fs and papaparse.
 *      According to Kaggle, there should be 2514 reviews.
 * @param {string} filename - path to the csv file to be parsed
 * @returns {Object} - The parsed csv file of app reviews from papaparse.
 */
function parseData(filename) {
    const fileContents = fs.readFileSync(filename, 'utf8');
    const parsed = Papa.parse(fileContents, {
        header: true,
        skipEmptyLines: true,
        transformHeader: (h) => h.trim(),
    });
    return parsed;
}

/**
 * [TODO] Step 2: Clean the Data
 *      Filter out every data record with null column values, ignore null gender values.
 *
 *      Merge all the user statistics, including user_id, user_age, user_country, and user_gender,
 *          into an object that holds them called "user", while removing the original properties.
 *
 *      Convert review_id, user_id, num_helpful_votes, and user_age to Integer
 *
 *      Convert rating to Float
 *
 *      Convert review_date to Date
 * @param {Object} csv - a parsed csv file of app reviews
 * @returns {Object} - a cleaned csv file with proper data types and removed null values
 */
function cleanData(csv) {
    const isNullish = (val) => {
        if (val === undefined || val === null) return true;
        const str = String(val).trim();
        if (str.length === 0) return true;
        const lowered = str.toLowerCase();
        return lowered === 'null' || lowered === 'na' || lowered === 'n/a';
    };

    const cleaned = [];

    for (const record of csv.data) {
        // Ensure we do not filter out based on user_gender, but all other fields cannot be nullish
        let hasNullOtherThanGender = false;
        for (const [key, value] of Object.entries(record)) {
            if (key === 'user_gender') continue; // allowed to be null/empty
            if (isNullish(value)) {
                hasNullOtherThanGender = true;
                break;
            }
        }
        if (hasNullOtherThanGender) continue;

        // Clone to avoid mutating original
        const review = { ...record };

        // Type conversions
        const toInt = (v) => {
            const n = parseInt(String(v).trim(), 10);
            return Number.isNaN(n) ? undefined : n;
        };
        const toFloat = (v) => {
            const n = parseFloat(String(v).trim());
            return Number.isNaN(n) ? undefined : n;
        };
        const toBool = (v) => {
            const s = String(v).trim().toLowerCase();
            if (['true', 'yes', 'y', '1'].includes(s)) return true;
            if (['false', 'no', 'n', '0'].includes(s)) return false;
            return false;
        };

        review.review_id = toInt(review.review_id);
        // rating could be decimal
        review.rating = toFloat(review.rating);
        review.review_date = new Date(review.review_date);
        review.verified_purchase = toBool(review.verified_purchase);
        review.num_helpful_votes = toInt(review.num_helpful_votes);

        const user = {
            user_age: toInt(review.user_age),
            user_country: review.user_country,
            user_gender: review.user_gender ?? '',
            user_id: toInt(review.user_id),
        };

        delete review.user_age;
        delete review.user_country;
        delete review.user_gender;
        delete review.user_id;

        review.user = user;

        cleaned.push(review);
    }

    return cleaned;
}

/**
 * [TODO] Step 3: Sentiment Analysis
 *      Write a function, labelSentiment, that takes in a rating as an argument
 *      and outputs 'positive' if rating is greater than 4, 'negative' is rating is below 2,
 *      and 'neutral' if it is between 2 and 4.
 * @param {Object} review - Review object
 * @param {number} review.rating - the numerical rating to evaluate
 * @returns {string} - 'positive' if rating is greater than 4, negative is rating is below 2,
 *                      and neutral if it is between 2 and 4.
 */
function labelSentiment({ rating }) {
    if (rating > 4.0) return 'positive';
    if (rating < 2.0) return 'negative';
    return 'neutral';
}

/**
 * [TODO] Step 3: Sentiment Analysis by App
 *      Using the previous labelSentiment, label the sentiments of the cleaned data
 *      in a new property called "sentiment".
 *      Add objects containing the sentiments for each app into an array.
 * @param {Object} cleaned - the cleaned csv data
 * @returns {{app_name: string, positive: number, neutral: number, negative: number}[]} - An array of objects, each summarizing sentiment counts for an app
 */
function sentimentAnalysisApp(cleaned) {
    const countsByApp = new Map();
    for (const review of cleaned) {
        const sentiment = labelSentiment({ rating: review.rating });
        review.sentiment = sentiment;
        const key = review.app_name;
        if (!countsByApp.has(key)) {
            countsByApp.set(key, {
                app_name: key,
                positive: 0,
                neutral: 0,
                negative: 0,
            });
        }
        countsByApp.get(key)[sentiment] += 1;
    }
    return Array.from(countsByApp.values());
}

/**
 * [TODO] Step 3: Sentiment Analysis by Language
 *      Using the previous labelSentiment, label the sentiments of the cleaned data
 *      in a new property called "sentiment".
 *      Add objects containing the sentiments for each language into an array.
 * @param {Object} cleaned - the cleaned csv data
 * @returns {{lang_name: string, positive: number, neutral: number, negative: number}[]} - An array of objects, each summarizing sentiment counts for a language
 */
function sentimentAnalysisLang(cleaned) {
    const countsByLang = new Map();
    for (const review of cleaned) {
        const sentiment = labelSentiment({ rating: review.rating });
        review.sentiment = review.sentiment || sentiment;
        const key = review.review_language;
        if (!countsByLang.has(key)) {
            countsByLang.set(key, {
                lang_name: key,
                positive: 0,
                neutral: 0,
                negative: 0,
            });
        }
        countsByLang.get(key)[sentiment] += 1;
    }
    return Array.from(countsByLang.values());
}

/**
 * [TODO] Step 4: Statistical Analysis
 *      Answer the following questions:
 *
 *      What is the most reviewed app in this dataset, and how many reviews does it have?
 *
 *      For the most reviewed app, what is the most commonly used device?
 *
 *      For the most reviewed app, what the average star rating (out of 5.0)?
 *
 *      Add the answers to a returned object, with the format specified below.
 * @param {Object} cleaned - the cleaned csv data
 * @returns {{mostReviewedApp: string, mostReviews: number, mostUsedDevice: String, mostDevices: number, avgRating: float}} -
 *          the object containing the answers to the desired summary statistics, in this specific format.
 */
function summaryStatistics(cleaned) {
    // Determine most reviewed app
    const countByApp = new Map();
    for (const r of cleaned) {
        const current = countByApp.get(r.app_name) || 0;
        countByApp.set(r.app_name, current + 1);
    }

    let mostReviewedApp = '';
    let mostReviews = 0;
    for (const [app, count] of countByApp) {
        if (count > mostReviews) {
            mostReviews = count;
            mostReviewedApp = app;
        }
    }

    // Filter reviews for that app
    const reviewsForApp = cleaned.filter((r) => r.app_name === mostReviewedApp);

    // Most commonly used device
    const deviceCounts = new Map();
    for (const r of reviewsForApp) {
        const device = r.device_type;
        deviceCounts.set(device, (deviceCounts.get(device) || 0) + 1);
    }
    let mostUsedDevice = '';
    let mostDevices = 0;
    for (const [device, count] of deviceCounts) {
        if (count > mostDevices) {
            mostDevices = count;
            mostUsedDevice = device;
        }
    }

    // Average rating rounded to 3 decimals
    const sum = reviewsForApp.reduce(
        (acc, r) => acc + (typeof r.rating === 'number' ? r.rating : 0),
        0,
    );
    const avg = reviewsForApp.length ? sum / reviewsForApp.length : 0;
    const avgRating = Number(avg.toFixed(3));

    return {
        mostReviewedApp,
        mostReviews,
        mostUsedDevice,
        mostDevices,
        avgRating,
    };
}

/**
 * Do NOT modify this section!
 */
module.exports = {
    parseData,
    cleanData,
    sentimentAnalysisApp,
    sentimentAnalysisLang,
    summaryStatistics,
    labelSentiment,
};
