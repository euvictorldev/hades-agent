const { parentPort, workerData } = require('node:worker_threads');
const path = require('node:path');
const fs = require('node:fs');

/**
 * Translation Worker Thread
 * Handles heavy AI inference using Transformers.js to avoid blocking the main Electron thread.
 * It uses the NLLB-200 model for high-quality multilingual translation.
 */

let pipeline;
let env;
let translatorPipeline = null;

/**
 * Mapping of ISO language codes to NLLB-200 language codes.
 */
const NLLB_LANG_MAP = {
    'pt': 'por_Latn',
    'en': 'eng_Latn',
    'es': 'spa_Latn',
    'fr': 'fra_Latn',
    'de': 'deu_Latn',
    'it': 'ita_Latn',
    'ja': 'jpn_Jpan',
    'zh': 'zho_Hans'
};

let initPromise = null;

/**
 * Internal initialization logic.
 * @private
 */
async function _doInit() {
    try {
        const transformers = await import('@huggingface/transformers');
        pipeline = transformers.pipeline;
        env = transformers.env;

        env.allowRemoteModels = true;
        env.cacheDir = workerData.modelsPath;

        if (env.backends?.onnx) {
            env.backends.onnx.wasm.simd = true;
            env.backends.onnx.wasm.numThreads = 2;
        }

        parentPort.postMessage({ type: 'status', message: 'Iniciando pipeline de tradução...' });

        translatorPipeline = await pipeline('translation', 'Xenova/nllb-200-distilled-600M', {
            quantized: true,
            progress_callback: (progress) => {
                parentPort.postMessage({ type: 'progress', data: progress });
            }
        });

        try {
            await translatorPipeline('Olá', {
                tgt_lang: 'eng_Latn',
                src_lang: 'por_Latn',
                num_beams: 1,
                max_new_tokens: 5
            });
            console.log('[WORKER] Warm-up completed.');
        } catch (warmupErr) {
            console.warn('[WORKER] Warm-up failed:', warmupErr);
        }

        parentPort.postMessage({ type: 'ready' });
        return true;
    } catch (err) {
        initPromise = null;
        parentPort.postMessage({ type: 'error', error: err.message });
        throw err;
    }
}

/**
 * Initializes the Transformers.js pipeline.
 */
async function init() {
    if (initPromise) return initPromise;
    initPromise = _doInit();
    return initPromise;
}

/**
 * Handles a translation request task.
 * @param {Object} task 
 */
async function handleTranslateTask(task) {
    try {
        if (!translatorPipeline) {
            await init();
        }

        const { text, targetLang, srcLang, id } = task;

        if (!text || text.trim().length < 2) {
            parentPort.postMessage({ type: 'translation-result', id, result: text });
            return;
        }

        const nllbTarget = NLLB_LANG_MAP[targetLang] || 'eng_Latn';
        const nllbSrc = NLLB_LANG_MAP[srcLang] || 'por_Latn';

        const startTime = performance.now();
        const output = await translatorPipeline(text, {
            tgt_lang: nllbTarget,
            src_lang: nllbSrc,
            num_beams: 1,
            max_new_tokens: 512
        });

        const duration = performance.now() - startTime;
        console.log(`[WORKER] Inference took ${duration.toFixed(2)}ms for ${text.length} chars.`);

        parentPort.postMessage({
            type: 'translation-result',
            id,
            result: output[0].translation_text
        });
    } catch (err) {
        parentPort.postMessage({
            type: 'translation-error',
            id: task.id,
            error: err.message
        });
    }
}

/**
 * Listen for translation tasks from the main process.
 */
parentPort.on('message', async (task) => {
    if (task.type === 'translate') {
        await handleTranslateTask(task);
    }
});

// Trigger initial load
init();
