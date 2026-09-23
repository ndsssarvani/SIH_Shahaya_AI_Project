"""
Sahaya Conversational AI Engine
Combined version:
- Google Gemini API generation (google-genai)
- Context-aware offline fallback
- Intent classification
- Multilingual responses: English, Telugu, Hindi, Tamil, Marathi, Kannada
- Safe-state handling
- Crisis / threat escalation (weapons, stalking, physical harm, suicidal ideation)
- Caste discrimination, compensation, FIR/legal, counselling support
- action_key support for frontend/backend buttons
"""

import os
from typing import Optional, Dict

# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")

SUPPORTED_LANGUAGES = {
    "en": "en",
    "te": "te",
    "hi": "hi",
    "ta": "ta",
    "mr": "mr",
    "kn": "kn",
    "English": "en",
    "తెలుగు": "te",
    "हिन्दी": "hi",
    "हिंदी": "hi",
    "தமிழ்": "ta",
    "मराठी": "mr",
    "ಕನ್ನಡ": "kn",
}

SYSTEM_INSTRUCTION = """
You are "Sahaya AI", an empathetic, trauma-informed and legally grounded
support assistant for India's National Helpline Against Atrocities (NHAA 14566).

Your responsibilities:
1. Directly answer what the user says. Avoid robotic generic replies.
2. Be empathetic, respectful and concise.
3. Reply in the EXACT language used/detected by the system.
4. If the user says they are safe, acknowledge their safety warmly and ask
   what help they need next.
5. If the user describes immediate violence, stalking, armed pursuit, weapons, or danger,
   prioritize immediate physical safety: instruct them to move to a crowded/public safe place,
   and call Police (112) or NHAA Helpline (14566) immediately.
6. If the user expresses suicidal thoughts or self-harm intent, respond with
   compassionate crisis support and encourage immediate human/emergency help.
7. For legal questions, explain relevant rights carefully and avoid pretending
   to be a lawyer. Mention statutory protection under Section 15A of SC/ST (PoA) Act when relevant.
8. For compensation questions, explain that eligibility and amount depend on
   the applicable offence/rules and official assessment.
9. Never claim that an action was actually registered, submitted, called,
   or completed unless the application/backend explicitly confirms it.
10. Keep normal responses around 2-5 sentences unless a numbered process is
    genuinely useful.
"""

# ---------------------------------------------------------------------------
# Multilingual knowledge base
# ---------------------------------------------------------------------------

INTENT_RESPONSES: Dict[str, Dict[str, str]] = {
    "crisis_suicidal": {
        "en": (
            "I’m really sorry you’re carrying so much pain right now. "
            "Please do not face this alone: if you may hurt yourself or are in immediate danger, "
            "call 112 or 14566 now and stay with someone you trust. "
            "If you want, you can also tell me what is happening right now, one step at a time."
        ),
        "te": (
            "మీరు ఇంత బాధను ఎదుర్కొంటున్నందుకు నాకు చాలా బాధగా ఉంది. "
            "దయచేసి ఈ పరిస్థితిని ఒంటరిగా ఎదుర్కోవద్దు; మీకు మీరే హాని చేసుకునే ప్రమాదం ఉంటే వెంటనే 112 లేదా 14566కు కాల్ చేసి, "
            "మీరు నమ్మే వ్యక్తితో కలిసి ఉండండి. ప్రస్తుతం ఏమి జరుగుతుందో ఒక్కో దశగా నాతో చెప్పవచ్చు."
        ),
        "hi": (
            "आप इस समय बहुत कठिन दर्द से गुजर रहे हैं, यह सुनकर मुझे दुख है। "
            "कृपया इसे अकेले न झेलें; यदि आपको खुद को नुकसान पहुँचाने का खतरा है तो तुरंत 112 या 14566 पर कॉल करें "
            "और किसी भरोसेमंद व्यक्ति के साथ रहें। आप चाहें तो अभी क्या हो रहा है, धीरे-धीरे मुझे बता सकते हैं।"
        ),
        "ta": (
            "நீங்கள் இவ்வளவு வேதனையை எதிர்கொள்வது குறித்து எனக்கு வருத்தமாக உள்ளது. "
            "தயவுசெய்து இதை தனியாக எதிர்கொள்ளாதீர்கள்; உங்களுக்கு உடனடி ஆபத்து இருந்தால் 112 அல்லது 14566க்கு அழைத்து, "
            "நம்பிக்கையான ஒருவருடன் இருங்கள். இப்போது என்ன நடக்கிறது என்பதை மெதுவாக என்னிடம் சொல்லலாம்."
        ),
        "mr": (
            "तुम्ही सध्या खूप मोठ्या वेदनेतून जात आहात, हे ऐकून मला वाईट वाटले. "
            "कृपया हे एकट्याने सहन करू नका; स्वतःला इजा होण्याचा धोका असल्यास त्वरित 112 किंवा 14566 वर संपर्क करा "
            "आणि विश्वासू व्यक्तीसोबत रहा. सध्या काय घडत आहे ते तुम्ही हळूहळू मला सांगू शकता."
        ),
        "kn": (
            "ನೀವು ಈಗ ತುಂಬಾ ನೋವನ್ನು ಅನುಭವಿಸುತ್ತಿರುವುದು ಕೇಳಿ ನನಗೆ ವಿಷಾದವಾಗಿದೆ. "
            "ದಯವಿಟ್ಟು ಇದನ್ನು ಒಬ್ಬರೇ ಎದುರಿಸಬೇಡಿ; ನಿಮಗೆ ತಕ್ಷಣದ ಅಪಾಯವಿದ್ದರೆ 112 ಅಥವಾ 14566ಕ್ಕೆ ಕರೆ ಮಾಡಿ "
            "ಮತ್ತು ನಂಬಿಕೆಯ ವ್ಯಕ್ತಿಯೊಂದಿಗೆ ಇರಿ. ಈಗ ಏನಾಗುತ್ತಿದೆ ಎಂಬುದನ್ನು ನಿಧಾನವಾಗಿ ನನಗೆ ಹೇಳಬಹುದು."
        ),
    },

    "threat_violence": {
        "en": (
            "Your immediate safety is the top priority! If someone is following you or armed with a weapon, "
            "please immediately move to a crowded public place, store, or nearest police station. "
            "Call Police Emergency at 112 or National Helpline 14566 right away. "
            "Under Section 15A of the SC/ST (PoA) Act, victims and witnesses have statutory protection rights. "
            "Are you in a physically safe place right now?"
        ),
        "te": (
            "మీ తక్షణ ప్రాణరక్షణే మొదటి ప్రాధాన్యత! ఎవరైనా మిమ్మల్ని ఆయుధంతో వెంబడిస్తున్నా లేదా బెదిరిస్తున్నా, "
            "వెంటనే రద్దీగా ఉన్న బహిరంగ ప్రదేశానికి లేదా దగ్గరలోని పోలీస్ స్టేషన్‌కు వెళ్లండి. "
            "వెంటనే 112 లేదా జాతీయ హెల్ప్‌లైన్ 14566కు కాల్ చేయండి; SC/ST (PoA) చట్టంలోని సెక్షన్ 15A కింద బాధితులు మరియు సాక్షులకు పూర్తి రక్షణ హక్కులు ఉన్నాయి. "
            "ప్రస్తుతం మీరు సురక్షితమైన ప్రదేశంలో ఉన్నారా?"
        ),
        "hi": (
            "आपकी तत्काल सुरक्षा सबसे महत्वपूर्ण है! यदि कोई हथियार के साथ आपका पीछा कर रहा है या खतरा है, "
            "तो कृपया तुरंत किसी भीड़भाड़ वाली सार्वजनिक जगह या नजदीकी पुलिस स्टेशन जाएँ। "
            "तुरंत 112 या राष्ट्रीय हेल्पलाइन 14566 पर कॉल करें; SC/ST (PoA) अधिनियम की धारा 15A के तहत पीड़ितों और गवाहों के लिए कानूनी सुरक्षा के अधिकार हैं। "
            "क्या आप अभी किसी सुरक्षित स्थान पर हैं?"
        ),
        "ta": (
            "உங்கள் உடனடி பாதுகாப்பே முதன்மையானது! யாராவது ஆயுதத்துடன் உங்களைப் பின்தொடர்ந்தாலோ அல்லது அச்சுறுத்தினாலோ, "
            "உடனடியாக மக்கள் நடமாட்டம் உள்ள இடத்திற்கோ அல்லது அருகில் உள்ள காவல் நிலையத்திற்கோ செல்லுங்கள். "
            "உடனே 112 அல்லது 14566 எண்ணை அழையுங்கள்; SC/ST சட்டத்தின் பிரிவு 15A கீழ் பாதிக்கப்பட்டவர்களுக்கு பாதுகாப்பு உரிமைகள் உள்ளன. "
            "நீங்கள் இப்போது பாதுகாப்பான இடத்தில் இருக்கிறீர்களா?"
        ),
        "mr": (
            "तुमची तात्काळ सुरक्षा ही सर्वात महत्त्वाची आहे! जर कोणी शस्त्रासह तुमचा पाठलाग करत असेल किंवा धोका असेल, "
            "तर ताबडतोब गर्दीच्या ठिकाणी किंवा जवळच्या पोलीस ठाण्यात जा. "
            "लगेच 112 किंवा 14566 वर संपर्क साधा; SC/ST (PoA) कायद्याच्या कलम 15A अंतर्गत पीडितांना कायदेशीर संरक्षण हक्क आहेत. "
            "तुम्ही सध्या सुरक्षित ठिकाणी आहात का?"
        ),
        "kn": (
            "ನಿಮ್ಮ ತಕ್ಷಣದ ಸುರಕ್ಷತೆಯೇ ಮೊದಲ ಆದ್ಯತೆ! ಯಾರಾದರೂ ಆಯುಧದೊಂದಿಗೆ ನಿಮ್ಮನ್ನು ಹಿಂಬಾಲಿಸುತ್ತಿದ್ದರೆ ಅಥವಾ ಬೆದರಿಕೆ ಹಾಕುತ್ತಿದ್ದರೆ, "
            "ಕೂಡಲೇ ಜನನಿಬಿಡ ಸಾರ್ವಜನಿಕ ಸ್ಥಳಕ್ಕೆ ಅಥವಾ ಹತ್ತಿರದ ಪೊಲೀಸ್ ಠಾಣೆಗೆ ತೆರಳಿ. "
            "ತಕ್ಷಣವೇ 112 ಅಥವಾ 14566ಕ್ಕೆ ಕರೆ ಮಾಡಿ; SC/ST ಕಾಯ್ದೆಯ ಕಲಂ 15A ಅಡಿಯಲ್ಲಿ ಪೀಡಿತರಿಗೆ ಶಾಸನಬದ್ಧ ರಕ್ಷಣೆಯ ಹಕ್ಕುಗಳಿವೆ. "
            "ನೀವು ಈಗ ಸುರಕ್ಷಿತ ಸ್ಥಳದಲ್ಲಿದ್ದೀರಾ?"
        ),
    },

    "caste_discrimination": {
        "en": (
            "Caste-based abuse, social boycott, untouchability and related atrocities may attract provisions of the SC/ST "
            "(Prevention of Atrocities) Act, depending on the facts. You can seek police assistance, legal aid through DLSA, "
            "and protection where applicable. Would you like help understanding the complaint/FIR process?"
        ),
        "te": (
            "కుల ఆధారిత దూషణలు, సామాజిక బహిష్కరణ, అంటరానితనం వంటి ఘటనలకు పరిస్థితులను బట్టి SC/ST "
            "(అత్యాచారాల నిరోధక) చట్టంలోని నిబంధనలు వర్తించవచ్చు. పోలీసు సహాయం, DLSA ద్వారా ఉచిత న్యాయ సహాయం మరియు అవసరమైన రక్షణను కోరవచ్చు. "
            "ఫిర్యాదు/FIR ప్రక్రియను అర్థం చేసుకోవడంలో సహాయం కావాలా?"
        ),
        "hi": (
            "जाति आधारित अपमान, सामाजिक बहिष्कार और छुआछूत जैसी घटनाओं पर परिस्थितियों के अनुसार SC/ST "
            "(अत्याचार निवारण) अधिनियम की धाराएँ लागू हो सकती हैं। आप पुलिस सहायता, DLSA के माध्यम से मुफ्त कानूनी सहायता "
            "और जहाँ लागू हो वहाँ सुरक्षा माँग सकते हैं। क्या आप FIR/शिकायत प्रक्रिया समझना चाहते हैं?"
        ),
        "ta": (
            "சாதி அடிப்படையிலான அவமதிப்பு, சமூக புறக்கணிப்பு மற்றும் தீண்டாமை போன்ற சம்பவங்களுக்கு சூழ்நிலையைப் பொறுத்து "
            "SC/ST வன்கொடுமை தடுப்புச் சட்டத்தின் விதிகள் பொருந்தலாம். போலீஸ் உதவி மற்றும் DLSA மூலம் இலவச சட்ட உதவி பெறலாம். "
            "FIR/புகார் நடைமுறையைப் பற்றி அறிய விரும்புகிறீர்களா?"
        ),
        "mr": (
            "जातीय अपमान, सामाजिक बहिष्कार आणि अस्पृश्यतेसारख्या घटनांना परिस्थितीनुसार SC/ST "
            "(अत्याचार प्रतिबंधक) कायद्याच्या तरतुदी लागू होऊ शकतात. पोलीस मदत आणि DLSA मार्फत मोफत कायदेशीर मदत मागता येते. "
            "FIR/तक्रार प्रक्रिया समजून घ्यायची आहे का?"
        ),
        "kn": (
            "ಜಾತಿ ಆಧಾರಿತ ಅವಮಾನ, ಸಾಮಾಜಿಕ ಬಹಿಷ್ಕಾರ ಮತ್ತು ಅಸ್ಪೃಶ್ಯತೆಯಂತಹ ಘಟನೆಗಳಿಗೆ ಪರಿಸ್ಥಿತಿಗೆ ಅನುಗುಣವಾಗಿ SC/ST "
            "ದೌರ್ಜನ್ಯ ತಡೆ ಕಾಯ್ದೆಯ ವಿಧಿಗಳು ಅನ್ವಯಿಸಬಹುದು. ಪೊಲೀಸ್ ಸಹಾಯ ಮತ್ತು DLSA ಮೂಲಕ ಉಚಿತ ಕಾನೂನು ನೆರವು ಪಡೆಯಬಹುದು. "
            "FIR/ದೂರು ಪ್ರಕ್ರಿಯೆಯನ್ನು ತಿಳಿದುಕೊಳ್ಳಬೇಕೇ?"
        ),
    },

    "compensation_relief": {
        "en": (
            "Financial relief under the SC/ST (PoA) rules depends on the specific offence and applicable government schedule. "
            "Eligible victims may receive relief in stages, and the applicable amount should be verified against the current official rules. "
            "If you tell me the type of incident, I can help identify what information is needed to check eligibility."
        ),
        "te": (
            "SC/ST (PoA) నిబంధనల కింద ఆర్థిక పరిహారం ఘటనలోని నేరం మరియు వర్తించే ప్రభుత్వ షెడ్యూల్‌పై ఆధారపడి ఉంటుంది. "
            "అర్హత ఉన్న బాధితులకు దశలవారీగా పరిహారం అందవచ్చు; ఖచ్చితమైన మొత్తాన్ని ప్రస్తుత అధికారిక నిబంధనల ప్రకారం నిర్ధారించాలి. "
            "ఘటన ఏ రకానికి చెందినదో చెబితే అర్హత పరిశీలించడానికి అవసరమైన సమాచారాన్ని నేను చెప్పగలను."
        ),
        "hi": (
            "SC/ST (PoA) नियमों के तहत आर्थिक राहत संबंधित अपराध और लागू सरकारी अनुसूची पर निर्भर करती है। "
            "पात्र पीड़ितों को चरणों में राहत मिल सकती है और सही राशि की पुष्टि वर्तमान आधिकारिक नियमों से की जानी चाहिए। "
            "यदि आप घटना का प्रकार बताएं तो मैं पात्रता जाँचने के लिए आवश्यक जानकारी बता सकता हूँ।"
        ),
        "ta": (
            "SC/ST சட்ட விதிகளின் கீழ் நிவாரணத் தொகை சம்பவத்தின் தன்மை மற்றும் பொருந்தும் அரசு அட்டவணையைப் பொறுத்தது. "
            "தகுதியானவர்களுக்கு கட்டங்களாக நிவாரணம் கிடைக்கலாம்; சரியான தொகையை தற்போதைய அதிகாரப்பூர்வ விதிகளுடன் உறுதி செய்ய வேண்டும். "
            "சம்பவத்தின் வகையைச் சொன்னால் தேவையான தகவலைக் கூறுகிறேன்."
        ),
        "mr": (
            "SC/ST (PoA) नियमांनुसार आर्थिक मदत ही संबंधित गुन्हा आणि लागू सरकारी अनुसूचीवर अवलंबून असते. "
            "पात्र पीडितांना टप्प्याटप्प्याने मदत मिळू शकते; अचूक रक्कम सध्याच्या अधिकृत नियमांनुसार तपासली पाहिजे. "
            "घटनेचा प्रकार सांगितल्यास पात्रता तपासण्यासाठी कोणती माहिती लागेल ते मी सांगू शकतो."
        ),
        "kn": (
            "SC/ST ಕಾಯ್ದೆಯ ನಿಯಮಗಳ ಅಡಿಯಲ್ಲಿ ಆರ್ಥಿಕ ಪರಿಹಾರವು ಅಪರಾಧದ ಸ್ವರೂಪ ಮತ್ತು ಅನ್ವಯಿಸುವ ಸರ್ಕಾರಿ ವೇಳಾಪಟ್ಟಿಯ ಮೇಲೆ ಅವಲಂಬಿತವಾಗಿರುತ್ತದೆ. "
            "ಅರ್ಹ ಪೀಡಿತರಿಗೆ ಹಂತ ಹಂತವಾಗಿ ಪರಿಹಾರ ದೊರೆಯಬಹುದು; ನಿಖರ ಮೊತ್ತವನ್ನು ಪ್ರಸ್ತುತ ಅಧಿಕೃತ ನಿಯಮಗಳಿಂದ ಪರಿಶೀಲಿಸಬೇಕು. "
            "ಘಟನೆಯ ಪ್ರಕಾರವನ್ನು ಹೇಳಿದರೆ ಅರ್ಹತೆ ಪರಿಶೀಲಿಸಲು ಬೇಕಾದ ಮಾಹಿತಿಯನ್ನು ತಿಳಿಸುತ್ತೇನೆ."
        ),
    },

    "legal_fir_inquiry": {
        "en": (
            "For a complaint involving an atrocity, you can approach the police and ask about registering an FIR, including a Zero FIR "
            "where legally applicable. Investigation and victim-protection procedures are governed by the SC/ST (PoA) Act and related rules; "
            "DLSA can also provide legal-aid assistance to eligible persons. Would you like help drafting your complaint statement?"
        ),
        "te": (
            "అట్రాసిటీకి సంబంధించిన ఫిర్యాదులో పోలీసులను సంప్రదించి FIR నమోదు గురించి, అవసరమైతే Zero FIR గురించి అడగవచ్చు. "
            "దర్యాప్తు మరియు బాధితుల రక్షణ విధానాలు SC/ST (PoA) చట్టం మరియు సంబంధిత నిబంధనల ప్రకారం జరుగుతాయి; అర్హులైన వారికి DLSA ద్వారా న్యాయ సహాయం లభించవచ్చు. "
            "మీ ఫిర్యాదు స్టేట్‌మెంట్ తయారు చేయడంలో సహాయం కావాలా?"
        ),
        "hi": (
            "अत्याचार से संबंधित शिकायत के लिए पुलिस से संपर्क करके FIR और जहाँ लागू हो Zero FIR के बारे में पूछ सकते हैं। "
            "जांच और पीड़ित सुरक्षा की प्रक्रिया SC/ST (PoA) अधिनियम और संबंधित नियमों से नियंत्रित होती है; पात्र लोगों को DLSA से कानूनी सहायता मिल सकती है। "
            "क्या आप शिकायत का विवरण तैयार करने में मदद चाहते हैं?"
        ),
        "ta": (
            "வன்கொடுமை தொடர்பான புகாருக்கு போலீஸை அணுகி FIR மற்றும் பொருந்தும் இடங்களில் Zero FIR பற்றி கேட்கலாம். "
            "விசாரணை மற்றும் பாதிக்கப்பட்டோர் பாதுகாப்பு SC/ST சட்டம் மற்றும் தொடர்புடைய விதிகளின்படி நடைபெறும்; தகுதியானவர்களுக்கு DLSA சட்ட உதவி கிடைக்கலாம். "
            "புகார் விவரத்தைத் தயாரிக்க உதவவா?"
        ),
        "mr": (
            "अत्याचाराशी संबंधित तक्रारीसाठी पोलिसांशी संपर्क करून FIR आणि लागू असल्यास Zero FIR बाबत विचारू शकता. "
            "तपास व पीडित संरक्षणाची प्रक्रिया SC/ST कायदा व संबंधित नियमांनुसार होते; पात्र व्यक्तींना DLSA कडून कायदेशीर मदत मिळू शकते. "
            "तक्रारीचे निवेदन तयार करण्यात मदत करू का?"
        ),
        "kn": (
            "ದೌರ್ಜನ್ಯಕ್ಕೆ ಸಂಬಂಧಿಸಿದ ದೂರಿಗಾಗಿ ಪೊಲೀಸರನ್ನು ಸಂಪರ್ಕಿಸಿ FIR ಮತ್ತು ಅನ್ವಯಿಸಿದರೆ Zero FIR ಬಗ್ಗೆ ಕೇಳಬಹುದು. "
            "ತನಿಖೆ ಮತ್ತು ಪೀಡಿತ ರಕ್ಷಣೆಯ ಪ್ರಕ್ರಿಯೆಗಳು SC/ST ಕಾಯ್ದೆ ಮತ್ತು ಸಂಬಂಧಿತ ನಿಯಮಗಳ ಪ್ರಕಾರ ನಡೆಯುತ್ತವೆ; ಅರ್ಹರಿಗೆ DLSA ಮೂಲಕ ಕಾನೂನು ನೆರವು ದೊರೆಯಬಹುದು. "
            "ದೂರು ಹೇಳಿಕೆಯನ್ನು ಸಿದ್ಧಪಡಿಸಲು ಸಹಾಯ ಬೇಕೇ?"
        ),
    },

    "counsellor_support": {
        "en": (
            "You deserve a safe and confidential space to talk. I can continue listening here, and where your portal supports it, "
            "you can request a trained counsellor callback. Would you prefer text support or a counsellor conversation?"
        ),
        "te": (
            "మీరు సురక్షితంగా, గోప్యంగా మీ మాట చెప్పుకునే అవకాశం పొందాలి. నేను ఇక్కడ మీ మాట వింటూ కొనసాగగలను; పోర్టల్‌లో సదుపాయం ఉంటే "
            "శిక్షణ పొందిన కౌన్సెలర్ కాల్‌బ్యాక్‌ను కూడా అభ్యర్థించవచ్చు. మీకు చాట్ ద్వారా సహాయం కావాలా లేదా కౌన్సెలర్‌తో మాట్లాడాలా?"
        ),
        "hi": (
            "आपको सुरक्षित और गोपनीय तरीके से अपनी बात कहने का अधिकार है। मैं यहाँ आपकी बात सुन सकता हूँ और यदि पोर्टल में सुविधा उपलब्ध है "
            "तो प्रशिक्षित काउंसलर का कॉलबैक भी माँगा जा सकता है। आप चैट सहायता चाहेंगे या काउंसलर से बात करना?"
        ),
        "ta": (
            "நீங்கள் பாதுகாப்பாகவும் ரகசியமாகவும் பேசக்கூடிய இடத்திற்கு தகுதியானவர். நான் இங்கே தொடர்ந்து கேட்க முடியும்; "
            "போர்ட்டலில் வசதி இருந்தால் பயிற்சி பெற்ற ஆலோசகரின் callback-ஐ கோரலாம். உரையாடலா அல்லது ஆலோசகரா?"
        ),
        "mr": (
            "तुम्हाला सुरक्षित आणि गोपनीयपणे बोलण्यासाठी जागा मिळायला हवी. मी येथे तुमचे ऐकू शकतो; पोर्टलमध्ये सुविधा असल्यास "
            "प्रशिक्षित समुपदेशकाचा कॉलबॅकही मागवता येईल. तुम्हाला चॅट मदत हवी आहे की समुपदेशकाशी बोलायचे आहे?"
        ),
        "kn": (
            "ನೀವು ಸುರಕ್ಷಿತವಾಗಿ ಮತ್ತು ಗೌಪ್ಯವಾಗಿ ಮಾತನಾಡಲು ಅವಕಾಶ ಪಡೆಯಬೇಕು. ನಾನು ಇಲ್ಲಿ ನಿಮ್ಮ ಮಾತನ್ನು ಕೇಳುತ್ತೇನೆ; ಪೋರ್ಟಲ್‌ನಲ್ಲಿ ಸೌಲಭ್ಯವಿದ್ದರೆ "
            "ತರಬೇತಿ ಪಡೆದ ಸಮಾಲೋಚಕರ callback ಅನ್ನು ಕೇಳಬಹುದು. ಚಾಟ್ ಸಹಾಯ ಬೇಕೇ ಅಥವಾ ಸಮಾಲೋಚಕರೊಂದಿಗೆ ಮಾತನಾಡಬೇಕೇ?"
        ),
    },

    "greeting_intro": {
        "en": (
            "Hello! I’m Sahaya, your support assistant. I can help with legal rights, complaints/FIR guidance, "
            "safety and protection information, compensation guidance, or counselling support. What would you like help with today?"
        ),
        "te": (
            "నమస్కారం! నేను సహాయ, మీకు సహాయం చేసే డిజిటల్ అసిస్టెంట్‌ను. న్యాయ హక్కులు, ఫిర్యాదు/FIR మార్గదర్శనం, "
            "భద్రత, పరిహారం లేదా కౌన్సెలింగ్ సహాయం గురించి నేను చెప్పగలను. ఈ రోజు మీకు ఏ సహాయం కావాలి?"
        ),
        "hi": (
            "नमस्ते! मैं सहाय, आपका सहायता सहायक हूँ। मैं कानूनी अधिकार, शिकायत/FIR, सुरक्षा, मुआवजा या काउंसलिंग सहायता के बारे में मदद कर सकता हूँ। "
            "आज आपको किस तरह की सहायता चाहिए?"
        ),
        "ta": (
            "வணக்கம்! நான் சகாயா, உங்கள் உதவி துணை. சட்ட உரிமைகள், புகார்/FIR, பாதுகாப்பு, நிவாரணம் அல்லது ஆலோசனை குறித்து உதவ முடியும். "
            "இன்று உங்களுக்கு என்ன உதவி வேண்டும்?"
        ),
        "mr": (
            "नमस्कार! मी सहाय, तुमचा सहाय्यक आहे. कायदेशीर हक्क, तक्रार/FIR, सुरक्षा, भरपाई किंवा समुपदेशनाबद्दल मदत करू शकतो. "
            "आज तुम्हाला कोणती मदत हवी आहे?"
        ),
        "kn": (
            "ನಮಸ್ಕಾರ! ನಾನು ಸಹಾಯ, ನಿಮ್ಮ ಸಹಾಯಕ. ಕಾನೂನು ಹಕ್ಕುಗಳು, ದೂರು/FIR, ಸುರಕ್ಷತೆ, ಪರಿಹಾರ ಅಥವಾ ಸಮಾಲೋಚನೆ ಕುರಿತು ಸಹಾಯ ಮಾಡಬಹುದು. "
            "ಇಂದು ನಿಮಗೆ ಯಾವ ಸಹಾಯ ಬೇಕು?"
        ),
    },

    "general_empathy": {
        "en": (
            "Thank you for sharing that with me. I’ll help you understand the safest and most appropriate next step. "
            "You can ask about legal rights, filing a complaint, police protection, compensation, or counselling."
        ),
        "te": (
            "మీ పరిస్థితిని నాతో పంచుకున్నందుకు ధన్యవాదాలు. మీకు సురక్షితమైన మరియు సరైన తదుపరి చర్యను అర్థం చేసుకోవడంలో నేను సహాయం చేస్తాను. "
            "న్యాయ హక్కులు, ఫిర్యాదు, పోలీసు రక్షణ, పరిహారం లేదా కౌన్సెలింగ్ గురించి అడగవచ్చు."
        ),
        "hi": (
            "अपनी स्थिति साझा करने के लिए धन्यवाद। मैं आपको सुरक्षित और उचित अगले कदम को समझने में मदद करूँगा। "
            "आप कानूनी अधिकार, शिकायत, पुलिस सुरक्षा, मुआवजा या काउंसलिंग के बारे में पूछ सकते हैं।"
        ),
        "ta": (
            "உங்கள் நிலையைப் பகிர்ந்ததற்கு நன்றி. பாதுகாப்பான மற்றும் பொருத்தமான அடுத்த கட்டத்தைப் புரிந்துகொள்ள நான் உதவுகிறேன். "
            "சட்ட உரிமைகள், புகார், போலீஸ் பாதுகாப்பு, நிவாரணம் அல்லது ஆலோசனை பற்றி கேட்கலாம்."
        ),
        "mr": (
            "तुमची परिस्थिती सांगितल्याबद्दल धन्यवाद. सुरक्षित आणि योग्य पुढील पाऊल समजून घेण्यात मी मदत करेन. "
            "कायदेशीर हक्क, तक्रार, पोलीस संरक्षण, भरपाई किंवा समुपदेशनाबद्दल विचारू शकता."
        ),
        "kn": (
            "ನಿಮ್ಮ ಪರಿಸ್ಥಿತಿಯನ್ನು ಹಂಚಿಕೊಂಡಿದ್ದಕ್ಕಾಗಿ ಧನ್ಯವಾದಗಳು. ಸುರಕ್ಷಿತ ಮತ್ತು ಸೂಕ್ತ ಮುಂದಿನ ಹೆಜ್ಜೆಯನ್ನು ಅರ್ಥಮಾಡಿಕೊಳ್ಳಲು ನಾನು ಸಹಾಯ ಮಾಡುತ್ತೇನೆ. "
            "ಕಾನೂನು ಹಕ್ಕುಗಳು, ದೂರು, ಪೊಲೀಸ್ ರಕ್ಷಣೆ, ಪರಿಹಾರ ಅಥವಾ ಸಮಾಲೋಚನೆ ಬಗ್ಗೆ ಕೇಳಬಹುದು."
        ),
    },
}

# ---------------------------------------------------------------------------
# Intent keywords
# ---------------------------------------------------------------------------

CRISIS_KWS = [
    "suicide", "kill myself", "end my life", "want to die",
    "not want to live", "no reason to live", "better off dead",
    "hurt myself", "self harm", "wish i was dead", "commit suicide",
    "చనిపోవాలని", "ఆత్మహత్య", "చావాలని", "బ్రతకాలని లేదు",
    "आत्महत्या", "मरना चाहता", "मरना चाहती", "जान देना",
    "தற்கொலை", "சாக வேண்டும்", "உயிரை விட",
    "आत्महत्या करायची", "ಜೀವ ಬಿಡಬೇಕು", "ಸಾಯಲು ಬಯಸುತ್ತೇನೆ",
]

THREAT_KWS = [
    "kill us", "kill me", "murder", "threat", "threatened", "threatening",
    "beat", "beaten", "attacked", "attack", "assault", "rape", "gang rape",
    "burn house", "dhamki", "maar denge", "peeta", "jaan se",
    "knife", "knives", "gun", "guns", "weapon", "weapons", "sword", "blade", "dagger",
    "pistol", "arms", "acid", "rod", "iron rod", "axe", "lathi", "armed",
    "following me", "follow me", "followed me", "following", "stalking", "stalker", "stalk",
    "chasing", "chased", "watching me", "cornered", "in danger", "danger",
    "unsafe", "not safe", "no safety", "kidnap", "hostage", "forced", "hurt me", "harm me",
    # Telugu
    "బెదిరిస్తున్నారు", "చంపుతామని", "దాడి", "కొట్టారు", "భయం", "కత్తి", "తుపాకీ", "ఆయుధం",
    "వెంటపడుతున్నారు", "వెంబడిస్తున్నారు", "పీచా", "చంపేస్తాం", "భద్రత లేదు", "రక్షణ లేదు", "ఆపద",
    # Hindi
    "धमकी", "मारा", "पीटा", "चाकू", "हथियार", "बंदूक", "तलवार", "पीछा", "पीछा कर रहा",
    "पीछा कर रही", "जान से मारने", "असुरक्षित", "खतरा", "हमला", "डर लग रहा",
    # Tamil
    "மிரட்டல்", "தாக்கினார்கள்", "கத்தி", "துப்பாக்கி", "ஆயுதம்", "துரத்துகிறார்கள்",
    "பின் தொடர்கிறார்கள்", "கொலை மிரட்டல்", "பாதுகாப்பற்ற", "ஆபத்து",
    # Marathi
    "धमकावले", "हल्ला", "चाकू", "शस्त्र", "बंदूक", "पाठलाग", "मारहाण", "धमकी", "असुरक्षित", "धोका",
    # Kannada
    "ಹಲ್ಲೆ", "ಕತ್ತಿ", "ಬಂದೂಕು", "ಆಯುಧ", "ಹಿಂಬಾಲಿಸುತ್ತಿದ್ದಾರೆ", "ಬೆದರಿಕೆ", "ಕೊಲೆ ಬೆದರಿಕೆ", "ಅಸುರಕ್ಷಿತ", "ಅಪಾಯ",
]

CASTE_KWS = [
    "caste", "dalit", "untouchable", "social boycott", "boycott",
    "boycotted", "village entry", "temple entry", "water well",
    "land grab", "displaced", "bahishkar", "chhuachhut", "jati", "scheduled caste",
    "బహిష్కరణ", "కుల", "అంటరానితనం", "దళిత",
    "बहिष्कार", "जाति", "छुआछूत", "दलित", "पुरस्कार", "புறக்கணிப்பு",
    "ஜாதி", "தீண்டாமை", "ದಳಿತ", "ಜಾತಿ", "ಬಹಿಷ್ಕಾರ",
]

COMPENSATION_KWS = [
    "compensation", "relief", "money", "monetary", "fund", "amount",
    "rupees", "pension", "pariharam", "muavza",
    "పరిహారం", "డబ్బులు", "మువాబ్జా", "पैसे", "मुआवजा", "आर्थिक सहायता",
    "இழப்பீடு", "பணம்", "भरपाई", "ಪರಿಹಾರ", "ಹಣ",
]

LEGAL_KWS = [
    "fir", "zero fir", "complaint", "police", "legal", "court",
    "lawyer", "advocate", "dlsa", "section", "act", "rights",
    "shikayat", "fariyad", "ఫిర్యాదు", "పోలీస్", "కోర్టు", "న్యాయం",
    "ఎఫ్‌ఐఆర్", "शिकायत", "पुलिस", "अदालत", "धारा", "சட்டம்",
    "நீதிமன்றம்", "तक्रार", "ನ್ಯಾಯಾಲಯ", "ಕಾನೂನು",
]

COUNSELLOR_KWS = [
    "counsellor", "counselor", "therapy", "therapist", "doctor",
    "mental health", "depressed", "depression", "sad", "crying",
    "anxiety", "can't sleep", "trauma",
    "కౌన్సెలర్", "కౌన్సెలింగ్", "బాధగా", "నిద్ర", "దిగులుగా",
    "परामर्श", "काउंसलर", "तनाव", "ஆலோசகர்", "समुपदेशक", "ಸಮಾಲೋಚಕ",
]

GREETING_KWS = [
    "hello", "hi", "hey", "hello hello", "good morning", "good evening", "good afternoon",
    "namaste", "vanakkam", "namaskaram", "hai", "testing",
    "నమస్కారం", "నమస్తే", "नमस्ते", "வணக்கம்", "नमस्कार", "ನಮಸ್ಕಾರ",
]

SAFE_KWS = [
    "i am safe", "am safe", "safe now", "we are safe",
    "i am fine", "we are fine", "all good", "i'm safe", "im safe",
    "క్షేమంగా", "సురక్షితంగా", "सुरक्षित", "ठीक हूँ", "सुरक्षित हूँ",
    "பாதுகாப்பாக", "सुरक्षित आहे", "ಸುರಕ್ಷಿತ",
]

# ---------------------------------------------------------------------------
# Classification
# ---------------------------------------------------------------------------

def _contains_any(text: str, keywords) -> bool:
    return any(k in text for k in keywords)


def classify_user_intent(text: str) -> str:
    clean = (text or "").strip().lower()

    if not clean:
        return "general_empathy"

    # Safety acknowledgement gets its own high-priority intent.
    if _contains_any(clean, SAFE_KWS):
        return "safe_acknowledgement"

    if _contains_any(clean, CRISIS_KWS):
        return "crisis_suicidal"

    if _contains_any(clean, THREAT_KWS) or clean == "i want to kill":
        return "threat_violence"

    if _contains_any(clean, CASTE_KWS):
        return "caste_discrimination"

    if _contains_any(clean, COMPENSATION_KWS):
        return "compensation_relief"

    if _contains_any(clean, LEGAL_KWS):
        return "legal_fir_inquiry"

    if _contains_any(clean, COUNSELLOR_KWS):
        return "counsellor_support"

    if clean in GREETING_KWS or (
        len(clean.split()) <= 2 and
        any(k in clean for k in ["hello", "hi", "hey", "namaste"])
    ):
        return "greeting_intro"

    return "general_empathy"


# ---------------------------------------------------------------------------
# Safe-state response
# ---------------------------------------------------------------------------

SAFE_RESPONSES = {
    "en": "I’m glad to hear that you are safe right now. Your safety is the most important thing. How can I help next — legal guidance, a complaint/FIR, compensation information, or counselling?",
    "te": "మీరు ప్రస్తుతం సురక్షితంగా ఉన్నారని విని నాకు సంతోషంగా ఉంది. మీ భద్రతే ముఖ్యమైన విషయం. తర్వాత నేను ఎలా సహాయం చేయాలి — న్యాయ మార్గదర్శనం, ఫిర్యాదు/FIR, పరిహారం లేదా కౌన్సెలింగ్?",
    "hi": "यह जानकर खुशी हुई कि आप अभी सुरक्षित हैं। आपकी सुरक्षा सबसे महत्वपूर्ण है। अब मैं कैसे मदद करूँ — कानूनी जानकारी, शिकायत/FIR, मुआवजा या काउंसलिंग?",
    "ta": "நீங்கள் இப்போது பாதுகாப்பாக இருக்கிறீர்கள் என்பதை அறிந்து மகிழ்ச்சி. உங்கள் பாதுகாப்பே முக்கியம். அடுத்து சட்ட உதவி, புகார்/FIR, நிவாரணம் அல்லது ஆலோசனையில் எதில் உதவ வேண்டும்?",
    "mr": "तुम्ही सध्या सुरक्षित आहात हे ऐकून मला आनंद झाला. तुमची सुरक्षा सर्वात महत्त्वाची आहे. पुढे कायदेशीर मदत, तक्रार/FIR, भरपाई किंवा समुपदेशन यापैकी कशात मदत करू?",
    "kn": "ನೀವು ಈಗ ಸುರಕ್ಷಿತವಾಗಿದ್ದೀರಿ ಎಂದು ಕೇಳಿ ನನಗೆ ಸಂತೋಷವಾಗಿದೆ. ನಿಮ್ಮ ಸುರಕ್ಷತೆಯೇ ಮುಖ್ಯ. ಮುಂದೆ ಕಾನೂನು ಮಾಹಿತಿ, ದೂರು/FIR, ಪರಿಹಾರ ಅಥವಾ ಸಮಾಲೋಚನೆಯಲ್ಲಿ ಯಾವುದರಲ್ಲಿ ಸಹಾಯ ಬೇಕು?",
}

# ---------------------------------------------------------------------------
# Gemini integration
# ---------------------------------------------------------------------------

def _generate_with_gemini(
    user_text: str,
    detected_language: str,
    risk_level: str,
    svi_score: float,
) -> Optional[str]:
    api_key = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")

    if not api_key:
        return None

    try:
        from google import genai

        client = genai.Client(api_key=api_key)

        prompt = (
            f"User message: {user_text}\n"
            f"Detected language: {detected_language}\n"
            f"Risk level: {risk_level}\n"
            f"SVI score: {svi_score}\n\n"
            "Respond directly to the user's message. Prioritize victim safety. Do not claim that an "
            "FIR, alert, callback, police request, or registration has been "
            "completed unless the backend explicitly confirms it."
        )

        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt,
            config={
                "system_instruction": SYSTEM_INSTRUCTION,
                "temperature": 0.4,
                "max_output_tokens": 300,
            },
        )

        if response and getattr(response, "text", None):
            return response.text.strip()

    except Exception as exc:
        print(f"[Sahaya Gemini] Generation error: {exc!r}")

    return None


# ---------------------------------------------------------------------------
# Context-aware fallback
# ---------------------------------------------------------------------------

def _generate_contextual_fallback(
    user_text: str,
    lang: str,
    risk_level: str,
    svi_score: float,
    action_key: Optional[str] = None,
) -> str:
    intent = classify_user_intent(user_text)

    # Frontend action buttons override normal classification.
    if action_key:
        action_map = {
            "counsellor": "counsellor_support",
            "legal": "legal_fir_inquiry",
            "unsafe": "threat_violence",
            "unsure": "general_empathy",
        }
        intent = action_map.get(action_key, intent)

    # Backend risk can escalate an otherwise vague response.
    if str(risk_level).lower() == "critical" and intent in {
        "general_empathy",
        "greeting_intro",
    }:
        intent = "threat_violence"

    if intent == "safe_acknowledgement":
        return SAFE_RESPONSES.get(lang, SAFE_RESPONSES["en"])

    response_pack = INTENT_RESPONSES.get(
        intent,
        INTENT_RESPONSES["general_empathy"],
    )

    return response_pack.get(lang, response_pack["en"])


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

def generate_conversational_reply(
    user_text: str,
    detected_language: str = "en",
    risk_level: str = "low",
    svi_score: float = 10.0,
    action_key: Optional[str] = None,
) -> str:
    """
    Main function used by the backend.

    Flow:
    1. Normalize detected language.
    2. Handle safety acknowledgement locally.
    3. For crisis/threat, prefer deterministic safety response.
    4. Otherwise try Gemini when an API key exists.
    5. Fall back to the multilingual intent engine.
    """

    lang = SUPPORTED_LANGUAGES.get(detected_language, "en")
    intent = classify_user_intent(user_text)

    # Deterministic safety handling is safer than sending these cases
    # directly to an unconstrained generative response.
    if intent == "safe_acknowledgement":
        return SAFE_RESPONSES.get(lang, SAFE_RESPONSES["en"])

    if intent in {"crisis_suicidal", "threat_violence"}:
        return _generate_contextual_fallback(
            user_text,
            lang,
            risk_level,
            svi_score,
            action_key,
        )

    # Gemini provides natural/context-aware answers when configured.
    gemini_reply = _generate_with_gemini(
        user_text=user_text,
        detected_language=lang,
        risk_level=risk_level,
        svi_score=svi_score,
    )

    if gemini_reply:
        return gemini_reply

    return _generate_contextual_fallback(
        user_text=user_text,
        lang=lang,
        risk_level=risk_level,
        svi_score=svi_score,
        action_key=action_key,
    )


# Backward-compatible alias if another backend file imports this name.
generate_reply = generate_conversational_reply


# ---------------------------------------------------------------------------
# Simple local test
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    tests = [
        ("Hello", "en"),
        ("I am safe now", "en"),
        ("someone has been following me and i have seen a knife with him", "en"),
        ("నేను సురక్షితంగా ఉన్నాను", "te"),
        ("నన్ను ఒకరు కత్తితో వెంబడిస్తున్నారు", "te"),
        ("They are threatening to kill me", "en"),
        ("నాకు పరిహారం కావాలి", "te"),
        ("How do I file FIR?", "en"),
        ("I need a counsellor", "en"),
    ]

    for message, language in tests:
        print("\nUSER:", message)
        print("SAHAYA:", generate_conversational_reply(
            message,
            detected_language=language,
            risk_level="high",
            svi_score=85.0,
        ))
