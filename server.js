const http = require('http');
const fetch = require('node-fetch');
const { v4: uuidv4 } = require('uuid');
const { ChromaClient, OllamaEmbeddingFunction } = require("chromadb");

const client = new ChromaClient({path: "http://chroma:8080"});
const embedder = new OllamaEmbeddingFunction({
    url: "http://ollama-embedding:8080/api/embeddings",
    model: "nomic-embed-text"
})

async function startServer() {

    // Create a collection within the vector DB.
    // This is a mandatory step.

    const collection = await client.getOrCreateCollection({
        name: "my_collection",
        embeddingFunction: embedder
    });

    // Let's add some text to the vector DB!
    // `documents` is an array of text chunks
    // `ids` is an array of unique IDs for each document.
    // For our simple purposes, we can use random UUIDs as the `ids`.

    await collection.add ({ documents: ["In space, nobody can hear you scream because space is a vacuum, meaning it has no air or other medium to carry sound waves. Sound waves require a medium like air, water, or solid objects to travel through. In the vacuum of space, there is no such medium, so sound cannot propagate. As a result, any sound you make, including a scream, would not be heard by anyone else."],
                            ids: [uuidv4()],
                          });


    // Now let's query the DB!
    // We'll just print out the result to the console so we can see that the
    // database and embedding model are working.

    // `queryTexts` is an array of query text.
    // `nResults` is the number of closest results chromadb should return.

    const results = await collection.query({
        queryTexts: ["Why can nobody hear you scream in space?"],
        nResults: 3,
    });
    console.log(results);

    const server = http.createServer(async (req, res) => {

        if (req.method === 'POST' && req.headers['content-type'] === 'text/plain') {

            // Do something here.

        } else {
            res.writeHead(405, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Only POST method with text/plain content-type is supported' }));
        }
    });

    server.listen(8080, () => console.log('Server running on port 8080'));
}

startServer().catch(err => {
    console.error('Error starting server:', err);
    process.exit(1);
});
