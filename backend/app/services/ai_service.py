import logging
import uuid
import re
from typing import Dict, Any, List, Optional
from app.core.config import settings

logger = logging.getLogger("swasthya_sense.ai")

# Emergency keywords across languages (en, hi, mr, bn, as)
EMERGENCY_KEYWORDS = [
    "chest pain", "heart attack", "difficulty breathing", "shortness of breath", 
    "severe bleeding", "unconscious", "stroke", "paralysis", "poison", "suicide",
    "छाती में दर्द", "सांस लेने में तकलीफ", "दिल का दौरा", "बेहोश",
    "छातीत दुखणे", "श्वास घेण्यास त्रास",
    "বুকে ব্যথা", "শ্বাসকষ্ট",
    "বুকৰ বিষ", "উশাহ-নিশাহ লোৱাত কষ্ট"
]

DISCLAIMERS = {
    "en": "Swasthya AI provides general health information and does not replace professional medical advice, diagnosis, or treatment.",
    "hi": "स्वास्थ्य एआई केवल सामान्य स्वास्थ्य जानकारी प्रदान करता है और पेशेवर चिकित्सा सलाह, निदान या उपचार का विकल्प नहीं है।",
    "mr": "स्वास्थ्य एआय केवळ सामान्य आरोग्य माहिती प्रदान करते आणि व्यावसायिक वैद्यकीय सल्ला, निदान किंवा उपचारांचा पर्याय नाही.",
    "bn": "স্বাস্থ্য এআই সাধারণ স্বাস্থ্য তথ্য প্রদান করে এবং পেশাদার চিকিৎসা পরামর্শ, রোগ নির্ণয় বা চিকিৎসার বিকল্প নয়।",
    "as": "স্বাস্থ্য এআই কেৱল সাধাৰণ স্বাস্থ্য তথ্য প্ৰদান কৰে আৰু পেছাদাৰী চিকিৎসা পৰামৰ্শ, নিদান বা চিকিৎসাৰ বিকল্প নহয়।"
}

EMERGENCY_MESSAGES = {
    "en": "CRITICAL EMERGENCY ALERT: Based on your description, this may be a medical emergency. Please dial 112 immediately or proceed to the nearest hospital Emergency Room without delay. Do not wait for online responses.",
    "hi": "गंभीर आपातकालीन चेतावनी: आपके विवरण के अनुसार यह एक चिकित्सीय आपात स्थिति हो सकती है। कृपया तुरंत 112 पर कॉल करें या बिना देर किए निकटतम अस्पताल के आपातकालीन कक्ष (ER) में जाएँ।",
    "mr": "गंभीर आणीबाणी इशारा: तुमच्या वर्णनानुसार ही वैद्यकीय आणीबाणी असू शकते. कृपया त्वरित 112 डायल करा किंवा विनाविलंब जवळच्या रुग्णालयाच्या आपत्कालीन कक्षात (ER) जा.",
    "bn": "জরুরী সতর্কতা: আপনার লক্ষণের ভিত্তিতে এটি একটি মেডিকেল জরুরী পরিস্থিতি হতে পারে। অবিলম্বে ১১২ নম্বরে কল করুন অথবা নিকটতম হাসপাতালের জরুরী বিভাগে যান।",
    "as": "জৰুৰী সতৰ্কবাণী: আপোনাৰ বিৱৰণৰ ওপৰত ভিত্তি কৰি এইটো এক চিকিৎসাজনিত জৰুৰীকালীন অৱস্থা হ'ব পাৰে। অনুগ্ৰহ কৰি লগে লগে ১১২ নম্বৰত যোগাযোগ কৰক বা নিকটৱৰ্তী চিকিৎসালয়ৰ জৰুৰীকালীন কক্ষলৈ যাওক।"
}

class SwasthyaAiService:
    def __init__(self):
        self.gemini_available = False
        if settings.GEMINI_API_KEY and not settings.GEMINI_API_KEY.startswith("placeholder"):
            try:
                import google.generativeai as genai
                genai.configure(api_key=settings.GEMINI_API_KEY)
                self.model = genai.GenerativeModel("gemini-1.5-flash")
                self.gemini_available = True
                logger.info("Google Gemini AI model initialized successfully.")
            except Exception as e:
                logger.warning(f"Failed to configure Gemini client: {e}")

    def detect_emergency(self, query: str) -> bool:
        lower_query = query.lower()
        for kw in EMERGENCY_KEYWORDS:
            if kw.lower() in lower_query:
                return True
        return False

    async def get_response(self, message: str, language: str = "en", conversation_id: Optional[str] = None, patient_context: Optional[str] = None) -> Dict[str, Any]:
        conv_id = conversation_id or str(uuid.uuid4())
        lang = language if language in DISCLAIMERS else "en"
        disclaimer = DISCLAIMERS[lang]

        # 1. Emergency Safety Filter
        if self.detect_emergency(message):
            return {
                "conversation_id": conv_id,
                "reply": EMERGENCY_MESSAGES[lang],
                "language": lang,
                "is_emergency": True,
                "disclaimer": disclaimer,
                "suggested_questions": [
                    "What are the nearest emergency hospitals?",
                    "How to prepare while waiting for an ambulance?",
                    "View Swasthya Sense Emergency Help card"
                ]
            }

        # 2. Try Gemini API if available
        if self.gemini_available:
            try:
                system_prompt = (
                    f"You are 'Swasthya AI', a compassionate, highly accurate AI healthcare assistant for the Swasthya Sense platform.\n"
                    f"Respond in language code: {lang}.\n"
                    f"STRICT SAFETY RULES:\n"
                    f"1. You are NOT a doctor. Never independently diagnose a patient.\n"
                    f"2. Never prescribe medications or change dosages.\n"
                    f"3. Never advise stopping prescribed medication.\n"
                    f"4. Clearly communicate uncertainty.\n"
                    f"5. Always encourage consulting a qualified doctor.\n"
                    f"6. If user asks about symptoms, explain general potential causes neutrally and suggest practical questions they can ask their doctor.\n"
                    f"7. Keep responses concise, clear, and easy to understand for patients."
                )
                if patient_context:
                    system_prompt += f"\nAuthorized Patient Context: {patient_context}"

                full_prompt = f"{system_prompt}\n\nPatient Query: {message}"
                response = self.model.generate_content(full_prompt)
                
                return {
                    "conversation_id": conv_id,
                    "reply": response.text.strip(),
                    "language": lang,
                    "is_emergency": False,
                    "disclaimer": disclaimer,
                    "suggested_questions": self._generate_suggestions(message, lang)
                }
            except Exception as e:
                logger.error(f"Gemini generation error: {e}, using internal clinical engine")

        # 3. Safe Internal Multilingual Clinical Guidance Engine
        reply = self._generate_rule_based_response(message, lang)
        return {
            "conversation_id": conv_id,
            "reply": reply,
            "language": lang,
            "is_emergency": False,
            "disclaimer": disclaimer,
            "suggested_questions": self._generate_suggestions(message, lang)
        }

    def _generate_rule_based_response(self, message: str, lang: str) -> str:
        q = message.lower()

        # Responses structured by topic and localized
        if any(w in q for w in ["headache", "migraine", "सिरदर्द", "डोकेदुखी", "মাথাব্যথা", "মূৰৰ বিষ"]):
            responses = {
                "en": "Headaches can arise from various factors including dehydration, tension, lack of sleep, eye strain, or sinus pressure. It is helpful to rest in a quiet, dark room and ensure adequate hydration. If your headache is sudden and unusually severe, accompanied by fever, neck stiffness, or vision changes, please consult a physician promptly.",
                "hi": "सिरदर्द डिहाइड्रेशन, तनाव, नींद की कमी, आँखों पर जोर या साइनस के कारण हो सकता है। पर्याप्त पानी पिएं और शांत कमरे में आराम करें। यदि सिरदर्द अचानक और बहुत तीव्र हो, या बुखार और गर्दन में अकड़न हो, तो तुरंत डॉक्टर से संपर्क करें।",
                "mr": "डोकेदुखी ही डिहायड्रेशन, ताणतणाव, अपुरी झोप किंवा डोळ्यांवरील ताणामुळे होऊ शकते. पुरेसे पाणी प्या आणि शांत खोलीत विश्रांती घ्या. डोकेदुखी अचानक आणि तीव्र असल्यास डॉक्टरांचा सल्ला घ्या.",
                "bn": "মাথাব্যথা পানিশূন্যতা, অতিরিক্ত মানসিক চাপ, অনিদ্রা বা চোখের সমস্যার কারণে হতে পারে। পর্যাপ্ত পানি পান করুন এবং বিশ্রাম নিন। ব্যথা তীব্র হলে চিকিৎসকের সাথে যোগাযোগ করুন।",
                "as": "মূৰৰ বিষ ডিহাইড্ৰেচন, মানসিক চাপ, টোপনিৰ অভাৱ বা চকুৰ সমস্যাৰ বাবে হ'ব পাৰে। পৰ্যাপ্ত পানী খাওক আৰু বিশ্ৰাম লওক। বিষ বেছি হ'লে চিকিৎসকৰ পৰামৰ্শ লওক।"
            }
            return responses.get(lang, responses["en"])

        if any(w in q for w in ["fever", "temperature", "बुखार", "ताप", "জ্বর", "জ্বৰ"]):
            responses = {
                "en": "Fever is typically your body's immune response to an infection. It is important to stay hydrated with fluids and monitor your temperature periodically. If fever exceeds 102°F (38.9°C), persists beyond 3 days, or is accompanied by chills or difficulty breathing, please schedule a consultation with a doctor.",
                "hi": "बुखार आमतौर पर किसी संक्रमण के खिलाफ शरीर की प्रतिरक्षा प्रणाली की प्रतिक्रिया होती है। खूब तरल पदार्थ पिएं और तापमान मापते रहें। यदि बुखार 102°F से अधिक हो या 3 दिन से अधिक रहे, तो तुरंत डॉक्टर से मिलें।",
                "mr": "ताप हा सामान्यत: संसर्गाविरुद्ध शरीराच्या प्रतिकारशक्तीचा प्रतिसाद असतो. भरपूर द्रवपदार्थ प्या आणि ताप मोजा. ताप 3 दिवसांपेक्षा जास्त राहिल्यास डॉक्टरांचा सल्ला घ्या.",
                "bn": "জ্বর সাধারণত সংক্রমণের বিরুদ্ধে শরীরের রোগ প্রতিরোধ ক্ষমতার স্বাভাবিক প্রতিক্রিয়া। প্রচুর পানি ও তরল খাবার খান। জ্বর ৩ দিনের বেশি থাকলে ডাক্তারের পরামর্শ নিন।",
                "as": "জ্বৰ সাধাৰণতে সংক্ৰমণৰ বিৰুদ্ধে শৰীৰৰ প্ৰতিৰোধ ক্ষমতাৰ সঁহাৰি। প্ৰচুৰ তৰল পদাৰ্থ খাওক। জ্বৰ ৩ দিনৰ অধিক থাকিলে চিকিৎসকক দেখুৱাওক।"
            }
            return responses.get(lang, responses["en"])

        if any(w in q for w in ["diabetes", "sugar", "मधुमेह", "डायबिटीज", "রক্তের শর্করা", "মধুমেহ"]):
            responses = {
                "en": "Diabetes management involves balanced nutrition, regular physical activity, and tracking blood glucose levels. Foods rich in fiber such as leafy greens and whole grains support healthy glucose management. Always consult your endocrinologist or diabetologist before making any dietary or medication changes.",
                "hi": "डायबिटीज (मधुमेह) के प्रबंधन में संतुलित आहार, नियमित व्यायाम और ब्लड शुगर की नियमित जांच शामिल है। हरी सब्जियां और फाइबर युक्त भोजन फायदेमंद होते हैं। अपनी दवाओं या आहार में बदलाव करने से पहले अपने डॉक्टर से अवश्य सलाह लें।",
                "mr": "मधुमेहाचे व्यवस्थापन संतुलित आहार, नियमित व्यायाम आणि रक्तातील साखरेचे मोजमाप करून केले जाते. आपल्या औषधांमध्ये कोणताही बदल करण्यापूर्वी डॉक्टरांचा सल्ला घ्या.",
                "bn": "ডায়াবেটিস নিয়ন্ত্রণে সুষম খাদ্য, নিয়মিত শরীরচর্চা এবং রক্তে শর্করার মাত্রা নিয়মিত পরীক্ষা করা অপরিহার্য। যেকোনো পরিবর্তনের আগে ডাক্তারের পরামর্শ নিন।",
                "as": "মধুমেহ নিয়ন্ত্ৰণৰ বাবে সুষম আহাৰ, নিয়মীয়া ব্যায়াম আৰু তেজৰ শৰ্কৰা পৰীক্ষা কৰাটো প্ৰয়োজন। ঔষধ পৰিৱৰ্তন কৰাৰ আগতে চিকিৎসকৰ পৰামৰ্শ লওক।"
            }
            return responses.get(lang, responses["en"])

        # Default helpful healthcare guidance
        default_replies = {
            "en": f"I am Swasthya AI, your health assistant. You can ask me about common health symptoms, preventive wellness routines, explanations of medical terms, or preparing questions for your upcoming doctor consultation. How may I support your health journey today?",
            "hi": "मैं स्वास्थ्य एआई हूँ, आपका स्वास्थ्य सहायक। आप मुझसे सामान्य स्वास्थ्य लक्षणों, निवारक देखभाल, चिकित्सा शब्दों की सरल व्याख्या या डॉक्टर से पूछने वाले प्रश्नों के बारे में पूछ सकते हैं। मैं आपकी क्या मदद कर सकता हूँ?",
            "mr": "मी स्वास्थ्य एआय आहे, आपला आरोग्य सहाय्यक. आपण मला आरोग्य लक्षणे, प्रतिबंधात्मक काळजी किंवा डॉक्टरांसाठी प्रश्नांची तयारी याबद्दल विचारू शकता. मी आपल्याला कशी मदत करू?",
            "bn": "আমি স্বাস্থ্য এআই, আপনার স্বাস্থ্য সহায়ক। আপনি সাধারণ লক্ষণ, স্বাস্থ্যকর জীবনযাত্রা বা ডাক্তারের জন্য প্রশ্ন প্রস্তুত করার বিষয়ে জানতে পারেন। আমি কীভাবে সাহায্য করতে পারি?",
            "as": "মই স্বাস্থ্য এআই, আপোনাৰ স্বাস্থ্য সহায়ক। আপুনি স্বাস্থ্যৰ লক্ষণ, স্বাস্থ্যসন্মত অভ্যাস বা চিকিৎসকৰ সৈতে আলোচনাৰ বিষয়ে সুধিব পাৰে। মই কেনেদৰে সহায় কৰিব পাৰোঁ?"
        }
        return default_replies.get(lang, default_replies["en"])

    def _generate_suggestions(self, query: str, lang: str) -> List[str]:
        suggestions = {
            "en": [
                "How do I prepare for my doctor appointment?",
                "What questions should I ask my specialist?",
                "What are healthy daily water intake recommendations?"
            ],
            "hi": [
                "डॉक्टर के पास जाने से पहले क्या तैयारी करें?",
                "स्वस्थ जीवनशैली के सामान्य नियम क्या हैं?",
                "अपने लक्षणों को डॉक्टर को कैसे समझाएं?"
            ],
            "mr": [
                "डॉक्टरांच्या भेटीसाठी काय तयारी करावी?",
                "रोजच्या आहारात कोणत्या चांगल्या सवयी असाव्यात?",
                "लक्षणे डॉक्टरांना कशी सांगावीत?"
            ],
            "bn": [
                "ডাক্তারের সাথে সাক্ষাতের জন্য কীভাবে প্রস্তুতি নেব?",
                "কী ধরণের প্রশ্ন ডাক্তারের কাছে জিজ্ঞাসা করা উচিত?",
                "সুস্থ থাকার জন্য দৈনন্দিন অভ্যাস কী কী?"
            ],
            "as": [
                "চিকিৎসকৰ ওচৰলৈ যোৱাৰ আগতে কি প্ৰস্তুতি ল'ব লাগে?",
                "সুস্থ জীৱনধাৰাৰ বাবে কি কি নিয়ম মানিব লাগে?",
                "চিকিৎসকক কি কি প্ৰশ্ন সোধা উচিত?"
            ]
        }
        return suggestions.get(lang, suggestions["en"])

swasthya_ai = SwasthyaAiService()
