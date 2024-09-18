const express = require('express');
const router = express.Router();

const dotenv = require('dotenv');
dotenv.config();

const http = require('http');

router.get('/qdrant', (req, res) => {

    const textQuery = req.query.text;
    
    if(!textQuery) {
        return res.status(400);
    }

    // Get embedding
    embUrl = `http://${process.env.EMB_ENGINE_HOST}:${process.env.EMB_ENGINE_PORT}` +
        `/text?text=${textQuery}`

    http.get(embUrl, embRes => {
            let emb = ''
            
            embRes.on('data', chunk => {
                emb += chunk;
            });

            embRes.on('end', () => {
                try {
                    console.log("Sending embedding")

                    // Data to be sent in the POST request
                    const postData = JSON.stringify({
                        vector: JSON.parse(emb),
                        limit: 10,
                        with_payload: ["start_frame", "end_frame", "video", "sentence"]
                    });
                
                    // Options for the POST request
                    const options = {
                        hostname: process.env.QDRANT_HOST,
                        port: process.env.QDRANT_PORT,
                        path: '/collections/ucfclip-centroid/points/query',
                        method: 'POST',
                        headers: {
                        'Content-Type': 'application/json',
                        'Content-Length': Buffer.byteLength(postData)
                        }
                    };
                
                    const qdrantReq = http.request(options, qdrantRes => {
                        let qdrantData = '';

                        // Collect data chunks as they arrive
                        qdrantRes.on('data', (chunk) => {
                            qdrantData += chunk;
                        });
                    
                        // Process the complete response once all chunks are received
                        qdrantRes.on('end', () => {
                        try {
                            const results = JSON.parse(qdrantData);

                            resultsArray = []
                            
                            results.result.points.forEach(element => {
                                console.log('Hola')
                                resultsArray.push({
                                    video: element.payload.video,
                                    start_frame: element.payload.start_frame,
                                    end_frame: element.payload.end_frame,
                                    sentence: element.payload.sentence
                                })
                            });

                            const clientRes = {results: resultsArray}

                            res.json(clientRes);
                        } catch (error) {
                            res.status(500)
                        }
                        });
                    });

                    // Handle errors in the QDrant request
                    qdrantReq.on('error', (e) => {
                        res.status(500).json({ error: `QDrant request error: ${e.message}` });
                    });
            
                    // Write the data to the QDrant request body
                    qdrantReq.write(postData);
                    qdrantReq.end();
                } catch (err) {
                    res.status(500);
                }
            });
        }
    );
});

router.get('/milvus', (req, res) => {
    const textQuery = req.query.text;
    
    if(!textQuery) {
        return res.status(400);
    }

    // Get embedding
    embUrl = `http://${process.env.EMB_ENGINE_HOST}:${process.env.EMB_ENGINE_PORT}` +
        `/text?text=${textQuery}`

    http.get(embUrl, embRes => {
            let emb = ''
            
            embRes.on('data', chunk => {
                emb += chunk;
            });

            embRes.on('end', () => {
                try {
                    console.log("Sending embedding")

                    // Data to be sent in the POST request
                    const postData = JSON.stringify({
                        collectionName: 'ucfclipcentroid',
                        outputFields: ['video', 'start_frame', 'end_frame', 'sentence'],
                        limit: 10,
                        offset: 0,
                        data: JSON.parse(emb)
                    });
                
                    // Options for the POST request
                    const options = {
                        hostname: process.env.MILVUS_HOST,
                        port: process.env.MILVUS_PORT,
                        path: '/v2/vectordb/entities/search',
                        method: 'POST',
                        headers: {
                        'Content-Type': 'application/json',
                        'Content-Length': Buffer.byteLength(postData),
                        'Host': `${process.env.MILVUS_HOST}:${process.env.MILVUS_PORT}`
                        }
                    };
                
                    const qdrantReq = http.request(options, qdrantRes => {
                        let qdrantData = '';
                        
                        // Collect data chunks as they arrive
                        qdrantRes.on('data', (chunk) => {
                            qdrantData += chunk;
                        });
                    
                        // Process the complete response once all chunks are received
                        qdrantRes.on('end', () => {
                        try {
                            const results = JSON.parse(qdrantData);

                            resultsArray = []
                            
                            results.data.forEach(element => {
                                resultsArray.push({
                                    video: element.video,
                                    start_frame: element.start_frame,
                                    end_frame: element.end_frame,
                                    sentence: element.sentence
                                })
                            });

                            const clientRes = {results: resultsArray}

                            res.json(clientRes);
                        } catch (error) {
                            res.status(500)
                        }
                        });
                    });

                    // Handle errors in the QDrant request
                    qdrantReq.on('error', (e) => {
                        res.status(500).json({ error: `QDrant request error: ${e.message}` });
                    });
            
                    // Write the data to the QDrant request body
                    qdrantReq.write(postData);
                    qdrantReq.end();
                } catch (err) {
                    res.status(500);
                }
            });
        }
    );
});

module.exports = router;
