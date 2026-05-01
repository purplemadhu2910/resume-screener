import re, json, hashlib, uuid
from datetime import datetime
from pathlib import Path
import fitz
import docx
import nltk
from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_jwt_extended import (
    JWTManager, create_access_token, jwt_required, get_jwt_identity
)
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

nltk.download("stopwords", quiet=True)
from nltk.corpus import stopwords

app = Flask(__name__)
app.config["JWT_SECRET_KEY"] = "resume-screener-secret-2024"
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = False
CORS(app)
jwt = JWTManager(app)

# ── Simple file-based user store ──────────────────────────────────────────────
USERS_FILE = Path(__file__).parent / "users.json"

def load_users():
    if USERS_FILE.exists():
        return json.loads(USERS_FILE.read_text())
    return {}

def save_users(users):
    USERS_FILE.write_text(json.dumps(users, indent=2))

def hash_pw(password):
    return hashlib.sha256(password.encode()).hexdigest()

# ── Skills DB ─────────────────────────────────────────────────────────────────
SKILLS_DB = [
    "python","java","javascript","typescript","c++","c#","go","rust","kotlin","swift",
    "php","ruby","scala","r","matlab","bash","shell","perl",
    "react","angular","vue","nextjs","nodejs","express","django","flask","fastapi",
    "html","css","tailwind","bootstrap","graphql","rest","api","webpack","vite",
    "machine learning","deep learning","nlp","computer vision","tensorflow","pytorch",
    "keras","scikit-learn","pandas","numpy","matplotlib","seaborn","opencv",
    "data analysis","data science","feature engineering","model deployment",
    "llm","transformers","bert","gpt","rag","langchain","huggingface",
    "aws","azure","gcp","docker","kubernetes","ci/cd","jenkins","github actions",
    "terraform","ansible","linux","git","github","gitlab","bitbucket",
    "sql","mysql","postgresql","mongodb","redis","elasticsearch","firebase",
    "sqlite","oracle","cassandra","dynamodb",
    "communication","teamwork","leadership","problem solving","agile","scrum",
    "project management","time management","critical thinking",
    "microservices","system design","oop","data structures","algorithms",
    "unit testing","selenium","junit","pytest","postman","figma","jira",
]

# ── Learning resources map: skill → {title, url, platform, level} ─────────────
LEARNING_MAP = {
    "python": [
        {"title": "Python for Everybody", "url": "https://www.coursera.org/specializations/python", "platform": "Coursera", "level": "Beginner"},
        {"title": "Automate the Boring Stuff", "url": "https://automatetheboringstuff.com", "platform": "Free Book", "level": "Beginner"},
    ],
    "javascript": [
        {"title": "JavaScript Algorithms & DS", "url": "https://www.freecodecamp.org/learn/javascript-algorithms-and-data-structures/", "platform": "freeCodeCamp", "level": "Beginner"},
        {"title": "The Modern JavaScript Tutorial", "url": "https://javascript.info", "platform": "javascript.info", "level": "Intermediate"},
    ],
    "typescript": [
        {"title": "TypeScript Full Course", "url": "https://www.youtube.com/watch?v=30LWjhZzg50", "platform": "YouTube", "level": "Beginner"},
        {"title": "TypeScript Handbook", "url": "https://www.typescriptlang.org/docs/handbook/intro.html", "platform": "Official Docs", "level": "Beginner"},
    ],
    "react": [
        {"title": "React Official Tutorial", "url": "https://react.dev/learn", "platform": "react.dev", "level": "Beginner"},
        {"title": "Full Stack Open – React", "url": "https://fullstackopen.com/en/", "platform": "University of Helsinki", "level": "Intermediate"},
    ],
    "nextjs": [
        {"title": "Next.js Official Docs", "url": "https://nextjs.org/learn", "platform": "Vercel", "level": "Intermediate"},
    ],
    "nodejs": [
        {"title": "Node.js Crash Course", "url": "https://www.youtube.com/watch?v=fBNz5xF-Kx4", "platform": "YouTube", "level": "Beginner"},
        {"title": "The Odin Project – Node", "url": "https://www.theodinproject.com/paths/full-stack-javascript", "platform": "The Odin Project", "level": "Intermediate"},
    ],
    "django": [
        {"title": "Django for Beginners", "url": "https://djangoforbeginners.com", "platform": "Free Book", "level": "Beginner"},
        {"title": "Django Official Tutorial", "url": "https://docs.djangoproject.com/en/stable/intro/tutorial01/", "platform": "Official Docs", "level": "Beginner"},
    ],
    "fastapi": [
        {"title": "FastAPI Official Tutorial", "url": "https://fastapi.tiangolo.com/tutorial/", "platform": "Official Docs", "level": "Beginner"},
    ],
    "flask": [
        {"title": "Flask Mega-Tutorial", "url": "https://blog.miguelgrinberg.com/post/the-flask-mega-tutorial-part-i-hello-world", "platform": "Blog", "level": "Intermediate"},
    ],
    "machine learning": [
        {"title": "ML Specialization – Andrew Ng", "url": "https://www.coursera.org/specializations/machine-learning-introduction", "platform": "Coursera", "level": "Beginner"},
        {"title": "Hands-On ML with Scikit-Learn", "url": "https://www.oreilly.com/library/view/hands-on-machine-learning/9781492032632/", "platform": "O'Reilly", "level": "Intermediate"},
    ],
    "deep learning": [
        {"title": "Deep Learning Specialization", "url": "https://www.coursera.org/specializations/deep-learning", "platform": "Coursera", "level": "Intermediate"},
        {"title": "fast.ai Practical Deep Learning", "url": "https://course.fast.ai", "platform": "fast.ai", "level": "Intermediate"},
    ],
    "nlp": [
        {"title": "NLP with HuggingFace", "url": "https://huggingface.co/learn/nlp-course/chapter1/1", "platform": "HuggingFace", "level": "Intermediate"},
        {"title": "Stanford CS224N", "url": "https://web.stanford.edu/class/cs224n/", "platform": "Stanford", "level": "Advanced"},
    ],
    "computer vision": [
        {"title": "CS231n – Stanford", "url": "http://cs231n.stanford.edu", "platform": "Stanford", "level": "Advanced"},
        {"title": "OpenCV Python Tutorial", "url": "https://docs.opencv.org/4.x/d6/d00/tutorial_py_root.html", "platform": "Official Docs", "level": "Beginner"},
    ],
    "tensorflow": [
        {"title": "TensorFlow Developer Certificate", "url": "https://www.coursera.org/professional-certificates/tensorflow-in-practice", "platform": "Coursera", "level": "Intermediate"},
    ],
    "pytorch": [
        {"title": "PyTorch Official Tutorials", "url": "https://pytorch.org/tutorials/", "platform": "Official Docs", "level": "Intermediate"},
        {"title": "Deep Learning with PyTorch", "url": "https://www.learnpytorch.io", "platform": "learnpytorch.io", "level": "Beginner"},
    ],
    "scikit-learn": [
        {"title": "Scikit-learn User Guide", "url": "https://scikit-learn.org/stable/user_guide.html", "platform": "Official Docs", "level": "Intermediate"},
    ],
    "pandas": [
        {"title": "Pandas Official Getting Started", "url": "https://pandas.pydata.org/docs/getting_started/index.html", "platform": "Official Docs", "level": "Beginner"},
        {"title": "Kaggle Pandas Course", "url": "https://www.kaggle.com/learn/pandas", "platform": "Kaggle", "level": "Beginner"},
    ],
    "numpy": [
        {"title": "NumPy Quickstart", "url": "https://numpy.org/doc/stable/user/quickstart.html", "platform": "Official Docs", "level": "Beginner"},
    ],
    "data science": [
        {"title": "IBM Data Science Professional", "url": "https://www.coursera.org/professional-certificates/ibm-data-science", "platform": "Coursera", "level": "Beginner"},
        {"title": "Kaggle Learn", "url": "https://www.kaggle.com/learn", "platform": "Kaggle", "level": "Beginner"},
    ],
    "data analysis": [
        {"title": "Google Data Analytics Certificate", "url": "https://www.coursera.org/professional-certificates/google-data-analytics", "platform": "Coursera", "level": "Beginner"},
    ],
    "llm": [
        {"title": "LLM Bootcamp – Full Stack", "url": "https://fullstackdeeplearning.com/llm-bootcamp/", "platform": "FSDL", "level": "Intermediate"},
    ],
    "langchain": [
        {"title": "LangChain Official Docs", "url": "https://python.langchain.com/docs/get_started/introduction", "platform": "Official Docs", "level": "Intermediate"},
    ],
    "huggingface": [
        {"title": "HuggingFace NLP Course", "url": "https://huggingface.co/learn/nlp-course", "platform": "HuggingFace", "level": "Intermediate"},
    ],
    "docker": [
        {"title": "Docker Getting Started", "url": "https://docs.docker.com/get-started/", "platform": "Official Docs", "level": "Beginner"},
        {"title": "Docker & Kubernetes – Udemy", "url": "https://www.udemy.com/course/docker-kubernetes-the-practical-guide/", "platform": "Udemy", "level": "Intermediate"},
    ],
    "kubernetes": [
        {"title": "Kubernetes Official Tutorial", "url": "https://kubernetes.io/docs/tutorials/", "platform": "Official Docs", "level": "Intermediate"},
        {"title": "CKA Prep – KodeKloud", "url": "https://kodekloud.com/courses/certified-kubernetes-administrator-cka/", "platform": "KodeKloud", "level": "Advanced"},
    ],
    "aws": [
        {"title": "AWS Cloud Practitioner", "url": "https://aws.amazon.com/certification/certified-cloud-practitioner/", "platform": "AWS", "level": "Beginner"},
        {"title": "AWS Skill Builder", "url": "https://skillbuilder.aws", "platform": "AWS", "level": "Beginner"},
    ],
    "azure": [
        {"title": "Microsoft Azure Fundamentals AZ-900", "url": "https://learn.microsoft.com/en-us/certifications/azure-fundamentals/", "platform": "Microsoft Learn", "level": "Beginner"},
    ],
    "gcp": [
        {"title": "Google Cloud Skills Boost", "url": "https://cloudskillsboost.google", "platform": "Google", "level": "Beginner"},
    ],
    "sql": [
        {"title": "SQLZoo", "url": "https://sqlzoo.net", "platform": "SQLZoo", "level": "Beginner"},
        {"title": "Mode SQL Tutorial", "url": "https://mode.com/sql-tutorial/", "platform": "Mode", "level": "Beginner"},
    ],
    "postgresql": [
        {"title": "PostgreSQL Tutorial", "url": "https://www.postgresqltutorial.com", "platform": "postgresqltutorial.com", "level": "Beginner"},
    ],
    "mongodb": [
        {"title": "MongoDB University", "url": "https://learn.mongodb.com", "platform": "MongoDB", "level": "Beginner"},
    ],
    "redis": [
        {"title": "Redis University", "url": "https://university.redis.com", "platform": "Redis", "level": "Beginner"},
    ],
    "git": [
        {"title": "Pro Git Book", "url": "https://git-scm.com/book/en/v2", "platform": "Free Book", "level": "Beginner"},
        {"title": "Learn Git Branching", "url": "https://learngitbranching.js.org", "platform": "Interactive", "level": "Beginner"},
    ],
    "linux": [
        {"title": "Linux Command Line Basics", "url": "https://ubuntu.com/tutorials/command-line-for-beginners", "platform": "Ubuntu", "level": "Beginner"},
        {"title": "The Linux Command Line", "url": "https://linuxcommand.org/tlcl.php", "platform": "Free Book", "level": "Beginner"},
    ],
    "ci/cd": [
        {"title": "GitHub Actions Docs", "url": "https://docs.github.com/en/actions", "platform": "GitHub", "level": "Intermediate"},
    ],
    "terraform": [
        {"title": "HashiCorp Terraform Tutorials", "url": "https://developer.hashicorp.com/terraform/tutorials", "platform": "HashiCorp", "level": "Intermediate"},
    ],
    "system design": [
        {"title": "System Design Primer", "url": "https://github.com/donnemartin/system-design-primer", "platform": "GitHub", "level": "Intermediate"},
        {"title": "Grokking System Design", "url": "https://www.designgurus.io/course/grokking-the-system-design-interview", "platform": "Design Gurus", "level": "Advanced"},
    ],
    "data structures": [
        {"title": "DSA – freeCodeCamp", "url": "https://www.freecodecamp.org/learn/javascript-algorithms-and-data-structures/", "platform": "freeCodeCamp", "level": "Beginner"},
        {"title": "NeetCode Roadmap", "url": "https://neetcode.io/roadmap", "platform": "NeetCode", "level": "Intermediate"},
    ],
    "algorithms": [
        {"title": "Algorithms – Princeton (Coursera)", "url": "https://www.coursera.org/learn/algorithms-part1", "platform": "Coursera", "level": "Intermediate"},
        {"title": "LeetCode Patterns", "url": "https://seanprashad.com/leetcode-patterns/", "platform": "LeetCode", "level": "Intermediate"},
    ],
    "agile": [
        {"title": "Agile Fundamentals – Atlassian", "url": "https://www.atlassian.com/agile", "platform": "Atlassian", "level": "Beginner"},
    ],
    "graphql": [
        {"title": "GraphQL Official Tutorial", "url": "https://graphql.org/learn/", "platform": "Official Docs", "level": "Intermediate"},
    ],
    "microservices": [
        {"title": "Microservices.io Patterns", "url": "https://microservices.io/patterns/index.html", "platform": "microservices.io", "level": "Advanced"},
    ],
    "figma": [
        {"title": "Figma for Beginners", "url": "https://www.figma.com/resources/learn-design/", "platform": "Figma", "level": "Beginner"},
    ],
    "opencv": [
        {"title": "OpenCV Python Tutorials", "url": "https://docs.opencv.org/4.x/d6/d00/tutorial_py_root.html", "platform": "Official Docs", "level": "Beginner"},
    ],
    "feature engineering": [
        {"title": "Feature Engineering for ML – Kaggle", "url": "https://www.kaggle.com/learn/feature-engineering", "platform": "Kaggle", "level": "Intermediate"},
    ],
    "model deployment": [
        {"title": "Deploying ML Models – Coursera", "url": "https://www.coursera.org/learn/deploying-machine-learning-models", "platform": "Coursera", "level": "Intermediate"},
    ],
    "java": [
        {"title": "Java Programming MOOC", "url": "https://java-programming.mooc.fi", "platform": "University of Helsinki", "level": "Beginner"},
    ],
    "kotlin": [
        {"title": "Kotlin Official Docs", "url": "https://kotlinlang.org/docs/getting-started.html", "platform": "Official Docs", "level": "Beginner"},
    ],
    "go": [
        {"title": "Go Tour", "url": "https://go.dev/tour/welcome/1", "platform": "Official Docs", "level": "Beginner"},
    ],
    "rust": [
        {"title": "The Rust Book", "url": "https://doc.rust-lang.org/book/", "platform": "Free Book", "level": "Intermediate"},
    ],
    "pytest": [
        {"title": "pytest Official Docs", "url": "https://docs.pytest.org/en/stable/getting-started.html", "platform": "Official Docs", "level": "Beginner"},
    ],
    "selenium": [
        {"title": "Selenium with Python", "url": "https://selenium-python.readthedocs.io", "platform": "Official Docs", "level": "Beginner"},
    ],
}

# ── Project recommendations map ──────────────────────────────────────────────
PROJECTS_MAP = {
    "python": [
        {"title": "CLI Task Manager", "description": "Build a command-line to-do app with file persistence, priority levels, and due dates.", "difficulty": "Beginner", "tech": ["Python", "JSON", "argparse"]},
        {"title": "Web Scraper + Dashboard", "description": "Scrape job listings or news headlines and display trends in a simple dashboard.", "difficulty": "Intermediate", "tech": ["Python", "BeautifulSoup", "pandas", "matplotlib"]},
    ],
    "javascript": [
        {"title": "Real-time Chat App", "description": "Build a browser-based chat app with rooms and live messaging.", "difficulty": "Intermediate", "tech": ["JavaScript", "WebSockets", "Node.js"]},
        {"title": "Expense Tracker", "description": "Track income and expenses with charts, categories, and localStorage persistence.", "difficulty": "Beginner", "tech": ["JavaScript", "HTML", "CSS", "Chart.js"]},
    ],
    "typescript": [
        {"title": "Type-safe REST API Client", "description": "Build a fully typed API wrapper with generics, error handling, and retry logic.", "difficulty": "Intermediate", "tech": ["TypeScript", "Axios", "Zod"]},
    ],
    "react": [
        {"title": "Job Board App", "description": "Fetch and display job listings with filters, search, and bookmark functionality.", "difficulty": "Intermediate", "tech": ["React", "Tailwind CSS", "REST API"]},
        {"title": "Markdown Note-taking App", "description": "Write and preview markdown notes with local storage and tag filtering.", "difficulty": "Beginner", "tech": ["React", "marked.js", "localStorage"]},
    ],
    "nextjs": [
        {"title": "Personal Blog with CMS", "description": "A statically generated blog with MDX support, dark mode, and SEO optimization.", "difficulty": "Intermediate", "tech": ["Next.js", "MDX", "Tailwind CSS"]},
        {"title": "E-commerce Storefront", "description": "Product listing, cart, and checkout flow with server-side rendering.", "difficulty": "Advanced", "tech": ["Next.js", "Stripe", "PostgreSQL"]},
    ],
    "nodejs": [
        {"title": "REST API with Auth", "description": "Build a full CRUD REST API with JWT authentication and role-based access.", "difficulty": "Intermediate", "tech": ["Node.js", "Express", "MongoDB", "JWT"]},
        {"title": "File Upload Service", "description": "Upload, store, and serve files with size validation and cloud storage integration.", "difficulty": "Intermediate", "tech": ["Node.js", "Multer", "AWS S3"]},
    ],
    "django": [
        {"title": "Blog Platform", "description": "Full-featured blog with user auth, comments, tags, and an admin panel.", "difficulty": "Beginner", "tech": ["Django", "SQLite", "Bootstrap"]},
        {"title": "URL Shortener", "description": "Create short URLs with click tracking, expiry, and a stats dashboard.", "difficulty": "Intermediate", "tech": ["Django", "PostgreSQL", "Redis"]},
    ],
    "fastapi": [
        {"title": "ML Model API", "description": "Wrap a trained ML model in a FastAPI service with input validation and async endpoints.", "difficulty": "Intermediate", "tech": ["FastAPI", "scikit-learn", "Pydantic"]},
        {"title": "Real-time Notification Service", "description": "Push notifications to clients using Server-Sent Events or WebSockets.", "difficulty": "Intermediate", "tech": ["FastAPI", "WebSockets", "Redis"]},
    ],
    "flask": [
        {"title": "Resume Screener API", "description": "Build an API that compares resumes to job descriptions using NLP.", "difficulty": "Intermediate", "tech": ["Flask", "scikit-learn", "PyMuPDF"]},
    ],
    "machine learning": [
        {"title": "House Price Predictor", "description": "Predict house prices using regression models on the Ames Housing dataset.", "difficulty": "Beginner", "tech": ["Python", "scikit-learn", "pandas", "matplotlib"]},
        {"title": "Customer Churn Prediction", "description": "Classify customers likely to churn using ensemble methods and SHAP explanations.", "difficulty": "Intermediate", "tech": ["Python", "XGBoost", "SHAP", "pandas"]},
        {"title": "Spam Email Classifier", "description": "Train a Naive Bayes or SVM classifier to detect spam emails.", "difficulty": "Beginner", "tech": ["Python", "scikit-learn", "NLTK"]},
    ],
    "deep learning": [
        {"title": "Handwritten Digit Recognizer", "description": "Train a CNN on MNIST and deploy it as a web app where users draw digits.", "difficulty": "Beginner", "tech": ["PyTorch", "Flask", "HTML Canvas"]},
        {"title": "Image Classifier Web App", "description": "Fine-tune a ResNet model on a custom dataset and serve predictions via API.", "difficulty": "Intermediate", "tech": ["PyTorch", "FastAPI", "React"]},
    ],
    "nlp": [
        {"title": "Sentiment Analysis Dashboard", "description": "Analyze Twitter/Reddit posts for sentiment and display trends over time.", "difficulty": "Intermediate", "tech": ["Python", "HuggingFace", "Streamlit"]},
        {"title": "Resume Keyword Extractor", "description": "Extract key skills and entities from resumes using NER and TF-IDF.", "difficulty": "Beginner", "tech": ["Python", "spaCy", "scikit-learn"]},
        {"title": "AI Chatbot", "description": "Build a domain-specific chatbot using a fine-tuned transformer model.", "difficulty": "Advanced", "tech": ["Python", "HuggingFace", "FastAPI"]},
    ],
    "computer vision": [
        {"title": "Face Mask Detector", "description": "Detect whether people in images/video are wearing masks using a CNN.", "difficulty": "Intermediate", "tech": ["Python", "OpenCV", "TensorFlow"]},
        {"title": "Object Counter", "description": "Count objects in a video stream (cars, people) using YOLO.", "difficulty": "Intermediate", "tech": ["Python", "OpenCV", "YOLOv8"]},
    ],
    "tensorflow": [
        {"title": "Time Series Forecasting", "description": "Predict stock prices or weather using LSTM networks.", "difficulty": "Intermediate", "tech": ["TensorFlow", "Keras", "pandas"]},
    ],
    "pytorch": [
        {"title": "Neural Style Transfer", "description": "Apply the artistic style of one image to another using a pre-trained VGG network.", "difficulty": "Intermediate", "tech": ["PyTorch", "torchvision", "PIL"]},
        {"title": "Text Generation Model", "description": "Train a character-level RNN to generate text in the style of a given author.", "difficulty": "Intermediate", "tech": ["PyTorch", "Python"]},
    ],
    "scikit-learn": [
        {"title": "Movie Recommendation System", "description": "Build a content-based recommender using TF-IDF and cosine similarity.", "difficulty": "Beginner", "tech": ["scikit-learn", "pandas", "numpy"]},
        {"title": "Credit Risk Classifier", "description": "Predict loan default risk using Random Forest with feature importance analysis.", "difficulty": "Intermediate", "tech": ["scikit-learn", "pandas", "matplotlib"]},
    ],
    "pandas": [
        {"title": "COVID-19 Data Analysis", "description": "Analyze and visualize global COVID-19 trends with interactive charts.", "difficulty": "Beginner", "tech": ["pandas", "matplotlib", "seaborn"]},
        {"title": "Sales Dashboard", "description": "Process raw sales CSV data and generate a summary report with KPIs.", "difficulty": "Beginner", "tech": ["pandas", "openpyxl", "matplotlib"]},
    ],
    "sql": [
        {"title": "Library Management System", "description": "Design and query a relational database for books, members, and loans.", "difficulty": "Beginner", "tech": ["SQL", "PostgreSQL", "pgAdmin"]},
        {"title": "E-commerce Analytics", "description": "Write complex queries to analyze sales, customer behavior, and inventory.", "difficulty": "Intermediate", "tech": ["SQL", "PostgreSQL", "Metabase"]},
    ],
    "postgresql": [
        {"title": "Social Media Database", "description": "Design a normalized schema for users, posts, likes, and follows with optimized indexes.", "difficulty": "Intermediate", "tech": ["PostgreSQL", "Python", "psycopg2"]},
    ],
    "mongodb": [
        {"title": "Blog API with MongoDB", "description": "Build a REST API for a blog with nested comments and tag-based search.", "difficulty": "Beginner", "tech": ["MongoDB", "Node.js", "Express"]},
    ],
    "docker": [
        {"title": "Dockerized Full-Stack App", "description": "Containerize a React + Flask app with Docker Compose, including a database service.", "difficulty": "Intermediate", "tech": ["Docker", "Docker Compose", "React", "Flask"]},
        {"title": "Multi-stage Build Pipeline", "description": "Optimize a Docker image using multi-stage builds to minimize production image size.", "difficulty": "Intermediate", "tech": ["Docker", "Node.js"]},
    ],
    "kubernetes": [
        {"title": "Deploy App to Kubernetes", "description": "Deploy a containerized web app to a local Minikube cluster with scaling and health checks.", "difficulty": "Advanced", "tech": ["Kubernetes", "Docker", "Minikube"]},
    ],
    "aws": [
        {"title": "Serverless Image Resizer", "description": "Upload images to S3, trigger a Lambda to resize them, and serve via CloudFront.", "difficulty": "Intermediate", "tech": ["AWS Lambda", "S3", "CloudFront", "Python"]},
        {"title": "Static Website on AWS", "description": "Host a React app on S3 with CloudFront CDN and a custom domain via Route 53.", "difficulty": "Beginner", "tech": ["AWS S3", "CloudFront", "Route 53"]},
    ],
    "git": [
        {"title": "Open Source Contribution", "description": "Find a beginner-friendly GitHub issue, fork the repo, fix it, and submit a PR.", "difficulty": "Beginner", "tech": ["Git", "GitHub", "Any language"]},
    ],
    "system design": [
        {"title": "Design a URL Shortener", "description": "Implement a scalable URL shortener with Redis caching, analytics, and rate limiting.", "difficulty": "Advanced", "tech": ["Python", "Redis", "PostgreSQL", "Docker"]},
        {"title": "Design a Chat System", "description": "Build a real-time messaging system with WebSockets, message history, and presence indicators.", "difficulty": "Advanced", "tech": ["Node.js", "WebSockets", "Redis", "MongoDB"]},
    ],
    "data structures": [
        {"title": "Algorithm Visualizer", "description": "Visualize sorting and graph algorithms (BFS, DFS, Dijkstra) step by step in the browser.", "difficulty": "Intermediate", "tech": ["JavaScript", "React", "CSS Animations"]},
    ],
    "algorithms": [
        {"title": "LeetCode Tracker", "description": "Build a personal dashboard to track your LeetCode progress by topic and difficulty.", "difficulty": "Beginner", "tech": ["React", "localStorage", "Chart.js"]},
    ],
    "graphql": [
        {"title": "GraphQL Blog API", "description": "Build a blog API with GraphQL queries, mutations, and subscriptions.", "difficulty": "Intermediate", "tech": ["Node.js", "Apollo Server", "MongoDB"]},
    ],
    "redis": [
        {"title": "Rate Limiter Middleware", "description": "Implement a sliding window rate limiter using Redis for an Express API.", "difficulty": "Intermediate", "tech": ["Redis", "Node.js", "Express"]},
        {"title": "Session Cache Service", "description": "Replace database session lookups with Redis caching to improve API response time.", "difficulty": "Intermediate", "tech": ["Redis", "Python", "Flask"]},
    ],
    "microservices": [
        {"title": "Microservices E-commerce Backend", "description": "Split an e-commerce app into user, product, and order services communicating via REST.", "difficulty": "Advanced", "tech": ["Docker", "Node.js", "PostgreSQL", "RabbitMQ"]},
    ],
    "ci/cd": [
        {"title": "Automated Deploy Pipeline", "description": "Set up GitHub Actions to run tests, build a Docker image, and deploy on every push.", "difficulty": "Intermediate", "tech": ["GitHub Actions", "Docker", "SSH"]},
    ],
    "terraform": [
        {"title": "AWS Infrastructure as Code", "description": "Provision an EC2 instance, RDS database, and VPC using Terraform modules.", "difficulty": "Intermediate", "tech": ["Terraform", "AWS", "HCL"]},
    ],
    "llm": [
        {"title": "RAG-based Document Q&A", "description": "Upload PDFs and ask questions about them using a retrieval-augmented generation pipeline.", "difficulty": "Intermediate", "tech": ["LangChain", "OpenAI", "FAISS", "Python"]},
        {"title": "AI Code Reviewer", "description": "Build a tool that reviews GitHub PRs and suggests improvements using an LLM.", "difficulty": "Advanced", "tech": ["Python", "OpenAI API", "GitHub API"]},
    ],
    "langchain": [
        {"title": "Personal AI Assistant", "description": "Build a conversational assistant with memory, tool use, and document retrieval.", "difficulty": "Intermediate", "tech": ["LangChain", "OpenAI", "Python", "Streamlit"]},
    ],
    "data science": [
        {"title": "EDA Portfolio", "description": "Pick 3 public datasets and publish detailed EDA notebooks with insights and visualizations.", "difficulty": "Beginner", "tech": ["Python", "pandas", "seaborn", "Jupyter"]},
        {"title": "Kaggle Competition Entry", "description": "Participate in a Kaggle competition, document your approach, and share your notebook.", "difficulty": "Intermediate", "tech": ["Python", "scikit-learn", "XGBoost", "Kaggle"]},
    ],
    "linux": [
        {"title": "Bash Automation Scripts", "description": "Write scripts to automate backups, log rotation, and system health monitoring.", "difficulty": "Beginner", "tech": ["Bash", "Linux", "cron"]},
    ],
    "figma": [
        {"title": "Mobile App UI Design", "description": "Design a complete mobile app UI with components, auto-layout, and a prototype flow.", "difficulty": "Beginner", "tech": ["Figma", "UI Design"]},
    ],
    "agile": [
        {"title": "Scrum Board App", "description": "Build a Kanban board with drag-and-drop cards, sprints, and burndown charts.", "difficulty": "Intermediate", "tech": ["React", "DnD Kit", "Node.js"]},
    ],
    "opencv": [
        {"title": "Real-time Face Filter", "description": "Apply fun filters to faces detected in a webcam stream.", "difficulty": "Beginner", "tech": ["Python", "OpenCV", "dlib"]},
        {"title": "Document Scanner", "description": "Detect document edges in a photo, apply perspective correction, and enhance contrast.", "difficulty": "Intermediate", "tech": ["Python", "OpenCV", "numpy"]},
    ],
    "firebase": [
        {"title": "Real-time Collaborative Notes", "description": "Multi-user note-taking app with live sync using Firestore and Firebase Auth.", "difficulty": "Beginner", "tech": ["React", "Firebase", "Firestore"]},
    ],
    "selenium": [
        {"title": "Price Tracker Bot", "description": "Monitor product prices on e-commerce sites and send email alerts when prices drop.", "difficulty": "Beginner", "tech": ["Python", "Selenium", "smtplib"]},
    ],
    "feature engineering": [
        {"title": "Titanic Survival Prediction", "description": "Engineer features from the Titanic dataset and compare multiple classifiers.", "difficulty": "Beginner", "tech": ["Python", "pandas", "scikit-learn"]},
    ],
    "model deployment": [
        {"title": "ML Model as REST API", "description": "Train a model locally, serialize it with joblib, and serve predictions via a Flask/FastAPI endpoint.", "difficulty": "Intermediate", "tech": ["Python", "Flask", "joblib", "Docker"]},
    ],
}

def score_section(text: str, keywords: list) -> float:
    """Return 0-100 score for how many keywords appear in a text section."""
    if not keywords:
        return 0.0
    text_lower = text.lower()
    found = sum(1 for k in keywords if re.search(r"\b" + re.escape(k) + r"\b", text_lower))
    return round((found / len(keywords)) * 100, 1)

def extract_section(text: str, headers: list) -> str:
    """Crude section extractor — grabs text after a header until the next known header."""
    all_headers = [
        "experience", "education", "skills", "projects", "certifications",
        "summary", "objective", "awards", "publications", "languages",
    ]
    text_lower = text.lower()
    for header in headers:
        pattern = rf"(?i)\b{header}\b"
        m = re.search(pattern, text_lower)
        if m:
            start = m.end()
            end = len(text)
            for other in all_headers:
                if other not in headers:
                    om = re.search(rf"(?i)\b{other}\b", text_lower[start:])
                    if om:
                        end = min(end, start + om.start())
            return text[start:end]
    return ""

def compute_score_breakdown(resume_raw: str, jd_skills: list) -> dict:
    skills_section = extract_section(resume_raw, ["skills", "technical skills", "core competencies"])
    exp_section = extract_section(resume_raw, ["experience", "work experience", "employment"])
    edu_section = extract_section(resume_raw, ["education", "academic"])

    skills_score = score_section(skills_section or resume_raw, jd_skills)
    exp_score = score_section(exp_section or resume_raw, jd_skills)
    edu_score = score_section(edu_section or resume_raw, jd_skills)
    return {"skills": skills_score, "experience": exp_score, "education": edu_score}

def compute_keyword_density(resume_raw: str, jd_skills: list) -> list:
    """Count how many times each JD skill appears in the resume."""
    text_lower = resume_raw.lower()
    density = []
    for skill in jd_skills:
        count = len(re.findall(r"\b" + re.escape(skill) + r"\b", text_lower))
        density.append({"skill": skill, "count": count})
    return sorted(density, key=lambda x: x["count"], reverse=True)

def build_tiered_suggestions(score: float, missing: list) -> list:
    suggestions = []
    if score < 30:
        suggestions += [
            "Your resume needs significant tailoring — rewrite your summary to mirror the job description.",
            "Use the exact keywords from the JD in your bullet points.",
            "Consider restructuring your resume to highlight the most relevant experience first.",
        ]
    elif score < 50:
        suggestions += [
            "Tailor your resume language to closely mirror the job description keywords.",
            "Add a skills section that explicitly lists the required technologies.",
        ]
    elif score < 70:
        suggestions += [
            "Quantify your achievements (e.g., 'Improved performance by 30%').",
            "Ensure your resume is ATS-friendly with clean formatting and no tables/images.",
        ]
    else:
        suggestions.append("Great match! Ensure your resume is ATS-friendly with clean formatting.")
    if missing:
        suggestions.append(f"Add these missing skills to your resume: {', '.join(missing[:6])}.")
    return suggestions

def generate_cover_letter(name: str, jd_raw: str, matched: list, missing: list) -> str:
    role_match = re.search(r"(?:looking for|seeking|hiring)(?: a| an)? ([\w\s]+?)(?:\.|,|with|who)", jd_raw, re.I)
    role = role_match.group(1).strip() if role_match else "the advertised position"
    top_matched = ", ".join(matched[:5]) if matched else "relevant skills"
    growth_skills = ", ".join(missing[:3]) if missing else "new technologies"
    return f"""Dear Hiring Manager,

I am writing to express my strong interest in {role}. With hands-on experience in {top_matched}, I am confident in my ability to contribute meaningfully to your team from day one.

Throughout my career I have developed a solid foundation in the core competencies your role demands. I am particularly drawn to this opportunity because it aligns closely with my background and my desire to grow further in areas such as {growth_skills}.

I thrive in collaborative environments, take ownership of my work, and consistently deliver results. I would welcome the chance to discuss how my experience can benefit your team.

Thank you for your time and consideration.

Sincerely,
{name}"""

def build_project_recommendations(missing_skills: list, jd_skills: list) -> list:
    seen_titles = set()
    projects = []
    for skill in missing_skills + [s for s in jd_skills if s not in missing_skills]:
        if skill in PROJECTS_MAP:
            for p in PROJECTS_MAP[skill]:
                if p["title"] not in seen_titles:
                    seen_titles.add(p["title"])
                    projects.append({**p, "skill": skill})
        if len(projects) >= 6:
            break
    return projects


STOP_WORDS = set(stopwords.words("english"))


# ── Text helpers ──────────────────────────────────────────────────────────────
def extract_text_pdf(file) -> str:
    doc = fitz.open(stream=file.read(), filetype="pdf")
    return " ".join(page.get_text() for page in doc)

def extract_text_docx(file) -> str:
    document = docx.Document(file)
    return " ".join(p.text for p in document.paragraphs)

def clean(text: str) -> str:
    text = text.lower()
    text = re.sub(r"http\S+|www\S+", " ", text)
    text = re.sub(r"[^a-z0-9\s\+\#]", " ", text)
    text = re.sub(r"\s+", " ", text).strip()
    return " ".join(w for w in text.split() if w not in STOP_WORDS and len(w) > 1)

def compute_score(resume_clean: str, jd_clean: str) -> float:
    vec = TfidfVectorizer()
    tfidf = vec.fit_transform([resume_clean, jd_clean])
    return round(float(cosine_similarity(tfidf[0:1], tfidf[1:2])[0][0]) * 100, 1)

def extract_skills(text: str) -> list:
    text_lower = text.lower()
    return [s for s in SKILLS_DB if re.search(r"\b" + re.escape(s) + r"\b", text_lower)]

def build_learning_resources(missing_skills: list) -> list:
    resources = []
    for skill in missing_skills:
        if skill in LEARNING_MAP:
            resources.append({
                "skill": skill,
                "courses": LEARNING_MAP[skill]
            })
    return resources


# ── Auth routes ───────────────────────────────────────────────────────────────
@app.route("/register", methods=["POST"])
def register():
    data = request.get_json()
    name = (data.get("name") or "").strip()
    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""

    if not name or not email or not password:
        return jsonify({"error": "All fields are required"}), 400
    if len(password) < 6:
        return jsonify({"error": "Password must be at least 6 characters"}), 400

    users = load_users()
    if email in users:
        return jsonify({"error": "Email already registered"}), 409

    users[email] = {"id": str(uuid.uuid4()), "name": name, "password": hash_pw(password), "history": []}
    save_users(users)

    token = create_access_token(identity=json.dumps({"email": email, "name": name}))
    return jsonify({"token": token, "name": name, "email": email}), 201


@app.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""

    users = load_users()
    user = users.get(email)
    if not user or user["password"] != hash_pw(password):
        return jsonify({"error": "Invalid email or password"}), 401

    token = create_access_token(identity=json.dumps({"email": email, "name": user["name"]}))
    return jsonify({"token": token, "name": user["name"], "email": email})


# ── Analyze route (protected) ─────────────────────────────────────────────────
@app.route("/analyze", methods=["POST"])
@jwt_required()
def analyze():
    if "resume" not in request.files:
        return jsonify({"error": "No resume file provided"}), 400
    if "job_description" not in request.form:
        return jsonify({"error": "No job description provided"}), 400

    identity = json.loads(get_jwt_identity())
    email = identity["email"]
    name = identity["name"]

    file = request.files["resume"]
    jd_raw = request.form["job_description"]
    filename = file.filename.lower()

    try:
        if filename.endswith(".pdf"):
            resume_raw = extract_text_pdf(file)
        elif filename.endswith(".docx"):
            resume_raw = extract_text_docx(file)
        else:
            return jsonify({"error": "Unsupported file type. Upload PDF or DOCX."}), 400
    except Exception as e:
        return jsonify({"error": f"Failed to parse file: {str(e)}"}), 500

    resume_clean = clean(resume_raw)
    jd_clean = clean(jd_raw)

    score = compute_score(resume_clean, jd_clean)
    resume_skills = extract_skills(resume_raw)
    jd_skills = extract_skills(jd_raw)

    matched = sorted(set(resume_skills) & set(jd_skills))
    missing = sorted(set(jd_skills) - set(resume_skills))

    suggestions = build_tiered_suggestions(score, missing)
    score_breakdown = compute_score_breakdown(resume_raw, jd_skills)
    keyword_density = compute_keyword_density(resume_raw, jd_skills)
    cover_letter = generate_cover_letter(name, jd_raw, matched, missing)

    result = {
        "score": score,
        "score_breakdown": score_breakdown,
        "matched_skills": matched,
        "missing_skills": missing,
        "suggestions": suggestions,
        "keyword_density": keyword_density,
        "cover_letter": cover_letter,
        "learning_resources": build_learning_resources(missing),
        "project_recommendations": build_project_recommendations(missing, jd_skills),
    }

    # Save to history
    users = load_users()
    if email in users:
        if "history" not in users[email]:
            users[email]["history"] = []
        history_entry = {
            "id": str(uuid.uuid4()),
            "filename": file.filename,
            "date": datetime.utcnow().strftime("%Y-%m-%d %H:%M"),
            "score": score,
            "score_breakdown": score_breakdown,
            "matched_skills": matched,
            "missing_skills": missing,
            "suggestions": suggestions,
            "keyword_density": keyword_density,
            "cover_letter": cover_letter,
            "learning_resources": result["learning_resources"],
            "project_recommendations": result["project_recommendations"],
        }
        users[email]["history"].insert(0, history_entry)
        users[email]["history"] = users[email]["history"][:20]  # keep last 20
        save_users(users)

    return jsonify(result)


@app.route("/history", methods=["GET"])
@jwt_required()
def get_history():
    identity = json.loads(get_jwt_identity())
    email = identity["email"]
    users = load_users()
    history = users.get(email, {}).get("history", [])
    return jsonify({"history": history})


@app.route("/history/<entry_id>", methods=["DELETE"])
@jwt_required()
def delete_history_entry(entry_id):
    identity = json.loads(get_jwt_identity())
    email = identity["email"]
    users = load_users()
    if email in users and "history" in users[email]:
        users[email]["history"] = [h for h in users[email]["history"] if h["id"] != entry_id]
        save_users(users)
    return jsonify({"ok": True})


@app.route("/compare", methods=["POST"])
@jwt_required()
def compare():
    if "job_description" not in request.form:
        return jsonify({"error": "No job description provided"}), 400

    jd_raw = request.form["job_description"]
    jd_clean = clean(jd_raw)
    jd_skills = extract_skills(jd_raw)

    results = []
    for key in request.files:
        file = request.files[key]
        filename = file.filename.lower()
        try:
            if filename.endswith(".pdf"):
                resume_raw = extract_text_pdf(file)
            elif filename.endswith(".docx"):
                resume_raw = extract_text_docx(file)
            else:
                continue
        except Exception:
            continue

        resume_clean = clean(resume_raw)
        score = compute_score(resume_clean, jd_clean)
        resume_skills = extract_skills(resume_raw)
        matched = sorted(set(resume_skills) & set(jd_skills))
        missing = sorted(set(jd_skills) - set(resume_skills))
        results.append({
            "filename": file.filename,
            "score": score,
            "matched_skills": matched,
            "missing_skills": missing,
            "score_breakdown": compute_score_breakdown(resume_raw, jd_skills),
        })

    results.sort(key=lambda x: x["score"], reverse=True)
    for i, r in enumerate(results):
        r["rank"] = i + 1

    return jsonify({"results": results})


@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok"})


if __name__ == "__main__":
    app.run(debug=True, port=5000)
