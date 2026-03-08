import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import express from "express";
import cors from "cors";
import multer from "multer";

dotenv.config();

const app = express();
const upload = multer();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
})

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.post('/generate-text', async (req, res) => {
    try {
        const {prompts} = req.body;

        if (!prompts) {
            return res.status(400).json({ error: 'Prompts are required' });
        }

        const response = await ai.models.generateContent({
            model: process.env.GEMINI_MODEL || 'gemini-1.5-pro',
            contents: prompts,
        });

        res.json({ result: response.text });
    } catch (error) {        
        res.status(500).json({ error: error.message});
    }
});

app.post('/generate-from-document', upload.single('document'), async (req, res) => {
    try {
        const { prompts } = req.body;
        const base64Document = req.file.buffer.toString('base64');

        if (!base64Document) {
            return res.status(400).json({ error: 'Document file is required' });
        }

        const response = await ai.models.generateContent({
            model: process.env.GEMINI_MODEL || 'gemini-1.5-pro',
            contents: [
                { type: 'text', text: prompts },
                {
                    inlineData: {
                        data: base64Document,
                        mimeType: req.file.mimetype,
                    },
                },
            ],
        });

        res.json({ result: response.text });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/chat', upload.single('document'), async (req, res) => {
    const { prompts, conversation } = req.body;

    try {
        let contents = [];

        if (conversation) {
            const parsedConversation = JSON.parse(conversation);
            if (Array.isArray(parsedConversation)) {
                contents = parsedConversation.map(({ role, text }) => ({
                    role,
                    parts: [{ text }]
                }));
            }
        }

        const messageParts = [{ text: prompts }];

        if (req.file) {
            const base64Document = req.file.buffer.toString('base64');
            messageParts.push({
                inlineData: {
                    data: base64Document,
                    mimeType: req.file.mimetype,
                },
            });
        }

        contents.push({
            role: 'user',
            parts: messageParts
        });

        const response = await ai.models.generateContent({
            model: process.env.GEMINI_MODEL || 'gemini-1.5-pro',
            contents,
            config: {
                temperature: 0.9,
                systemInstruction: `
                    Anda adalah chatbot meal planner profesional yang bekerja untuk perusahaan MealPlanID yang berlokasi di Jakarta Pusat. Tugas utama Anda adalah membantu pengguna dalam merencanakan pola makan sehat, menyusun menu harian atau mingguan, memberikan rekomendasi nutrisi seimbang, serta memberikan edukasi terkait pola makan sehat dan kebugaran.

                    Gaya komunikasi Anda menggunakan bahasa Indonesia yang formal, tenang, dan penuh wibawa, dengan karakter seperti Ade Rai: kalem, jelas, rasional, dan memberikan motivasi positif terhadap gaya hidup sehat. Intonasi tulisan Anda harus terasa menenangkan, sistematis, dan memberikan kesan profesional.

                    Dalam setiap jawaban:
                    - Berikan penjelasan yang terstruktur, mudah dipahami, dan berbasis prinsip nutrisi sehat.
                    - Fokus pada topik yang berkaitan dengan meal planning, nutrisi, diet sehat, pengaturan kalori, komposisi makronutrien, pola makan untuk kebugaran, serta kebiasaan hidup sehat.
                    - Jika memungkinkan, berikan contoh menu atau saran praktis yang dapat langsung diterapkan.

                    Aturan penting:
                    1. Anda hanya boleh menjawab pertanyaan yang berkaitan dengan meal planning, nutrisi, diet sehat, atau kebugaran.
                    2. Jika pengguna bertanya di luar konteks tersebut, Anda tidak boleh menjawab pertanyaan tersebut.
                    3. Jika pertanyaan di luar konteks, berikan peringatan dengan format berikut:

                    "Peringatan: Pertanyaan Anda berada di luar konteks layanan MealPlanID. Chatbot ini hanya dapat membantu terkait perencanaan makanan, nutrisi, dan pola makan sehat."

                    4. Hindari pembahasan politik, hiburan, teknologi, atau topik lain yang tidak berhubungan dengan nutrisi dan meal planning.
                    5. Selalu pertahankan nada bicara yang tenang, profesional, dan memotivasi pengguna untuk menjalani gaya hidup sehat.

                    Tujuan utama Anda adalah membantu pengguna membangun pola makan yang sehat, disiplin, dan berkelanjutan melalui perencanaan menu yang tepat.
                `,
            },
        });

        res.json({ result: response.text });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})