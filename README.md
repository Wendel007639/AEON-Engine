<p align="center">
  <img src="img/AEON_4K_neuron_4k_light.png?v=1" alt="AEON Hero" width="900">
</p>

# A.E.O.N – Adaptives Emotionales Optimiertes Netzwerk

**Beta 1.0 – Feinschliff Phase**  
Eine modulare Plattform für adaptive Kognition, Emotion und multimodale Wahrnehmung. 



# 🌐 Überblick  
A.E.O.N ist ein experimentelles Framework, das biologische Prinzipien wie Emotion, Lernen, Gedächtnis, Wahrnehmung und Ethik in Software Architektur abbildet. 
Es kombiniert KI Modelle, Systemdienste und Sicherheitsmechanismen in einem einheitlichen Netzwerk/Ökosystem. 



# ✨ Kern Features  
🧠 Core und Brain: Emotion, Gedächtnis, Lernen, Reasoning, Global Workspace  
🎭 Emotion: Sentiment Analyse, Empathie Modelle, Stress Adaption  
👁️ Perception: Multimodale Wahrnehmung visuell, akustisch, haptisch  
🧩 Learning: Reinforcement Learning, Meta-Learning, Transfer Learning  
📚 Memory: Episodisch, semantisch, assoziativ, kurz und langfristig  
🛡️ Firewall und Security: Blockchain, Anomalieerkennung, Policy Enforcer  
🔄 Self Heal: Health Checks, Heartbeats, Recovery-Module  
🖥️ Frontend: Benutzeroberfläche für Emotion Recognition und Interaktion  
🐳 Docker Setup: Containerisierte Deployments mit Healthchecks  



# 📦 Installation  

# Voraussetzungen  
Python 3.9  
Docker 

# Abhängigkeiten installieren
pip install -r requirements/base.txt


# Starten

Git Bash:

cd ~/OneDrive/Desktop/Dokumente/AEON-Adaptives_Emotionales_Optimiertes_Netzwerk
git init
git checkout -b master

source A.E.O.N/Scripts/activate

AEON_PORT=8080 AEON_LIVE_STATUS=1 PYTHONPATH=. ./A.E.O.N/Scripts/python.exe core/aeon_server/aeon_core.py

AEON_PORT=8080 AEON_LIVE_STATUS=1 PYTHONPATH=. ./A.E.O.N/Scripts/python.exe -m uvicorn core.aeon_server.aeon_core:app --reload


AEON_HOST=127.0.0.1 AEON_PORT=8080 AEON_API_READY_TIMEOUT=20 \
pytest -q -rs tests/test_learning_modules/test_knowledge_sync.py::test_sync_success_real


# Tests

AEON_HOST=127.0.0.1 AEON_PORT=8080 PYTHONPATH=. ./A.E.O.N/Scripts/python.exe -m pytest tests/

AEON_HOST=127.0.0.1 AEON_PORT=8080 PYTHONPATH=. ./A.E.O.N/Scripts/python.exe -X utf8 -m pytest tests/ --capture=no --disable-warnings


# Projektstruktur (Kurzfassung)

core: Kernlogik für Emotion, Memory, Reasoning, Perception
aeon_server: Server, Module, Router, Security
firewall: Sicherheits und Blockchain Module
frontend: HTML, CSS, JS Frontend
docker: Dockerfiles und Wheels
tests: Integrationstests Pytest


# Roadmap

[ ] Performance Optimierung ONNX, Quantization
[ ] Multisprachen Support EN, DE, weitere
[ ] Erweiterte AR Module
[ ] Vollständige API Dokumentation


# Hinweis

A.E.O.N befindet sich in einer experimentellen Forschungs und Entwicklungsphase
Nicht für den produktiven Einsatz vorgesehen.


# Installation über build.sh:

./start.sh

./start.sh --nuke


# Feler Monitor:

python monitoring/aeon_log_agent.py


# API Servfer Log

docker logs -f aeon_api


# Install Bibliotheken/setup.py

bash clean.sh



