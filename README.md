<img width="816" height="544" alt="image" src="https://github.com/user-attachments/assets/6474f372-4795-4943-a002-cdc43a4a7350" />

<img width="1877" height="379" alt="image" src="https://github.com/user-attachments/assets/aa502675-89c6-4a12-8d0a-dc9ff535ea99" />

<img width="1293" height="719" alt="image" src="https://github.com/user-attachments/assets/1cfbf8f7-f789-41ee-b3f2-443f33bce3df" />

Integrated Automation System for Energy Efficiency & Quality Management
 Project Background & Vision:
This project addresses the critical challenge of "data silos" in modern injection molding manufacturing by integrating the Energy Management System (EMS), SAP, and cloud collaboration platforms. The objective was to replace error-prone manual data exports and complex monthly financial alignment (based on the 15th-of-the-month cycle) with a fully automated, end-to-end digital pipeline that provides real-time visibility into machine performance and energy consumption.

Advanced Data Acquisition via API Reverse Engineering:
The core of the system is a high-performance Python backend that bypasses traditional manual exports through API reverse engineering. By analyzing network traffic and authentication protocols, the script mimics OAuth2 login flows to securely fetch granular power and production data directly from the EMS RESTful APIs. This "headless" approach ensures continuous data synchronization without the need for a front-end user interface.

Cloud-Based Orchestration with Google Apps Script:
Leveraging the power of Google Workspace, the system uses Google Apps Script (GAS) as a centralized logic engine to orchestrate data across platforms. This layer manages the bidirectional synchronization between local CSV outputs and Smartsheet dashboards, using time-driven triggers to execute 24/7 audits. It programmatically handles row-level updates, such as automatically checking maintenance status boxes, ensuring the digital twin of the factory floor is always up to date.

Predictive Maintenance & Machine Learning:
Beyond simple data collection, the system incorporates a hybrid diagnostic engine that combines industrial domain expertise with a Random Forest machine learning model. This engine evaluates asset health across six dimensions—Downtime, Quality, Capacity, Aging, Energy, and Predictive trends—and dynamically adjusts evaluation weights based on historical patterns. This allows the system to provide proactive maintenance "Advisories," such as detecting mechanical friction risks through energy drift before a breakdown occurs.

Intelligent KPI Analytics & Redline Rules:
The analytics framework implements sophisticated business logic to calculate Key Performance Indicators like SEC (Specific Energy Consumption) and its associated Drift Rate. To ensure operational safety, "Redline Rules" are integrated into the scoring system, triggering mandatory maintenance alerts if a machine exceeds predefined quality incident thresholds or maximum operating intervals. This ensures that high-risk assets are intercepted before they impact production stability.

Retool Integration & Predictive Dashboard:
The final layer of the solution is a professional-grade monitoring cockpit built on Retool, providing a unified view of machine health and predictive warnings. This interface visualizes the output of the machine learning model, allowing engineers to see "Health Scores" at a glance and drill down into specific expert recommendations. The dashboard serves as the primary decision-making tool for the maintenance department, shifting their workflow from reactive repair to data-driven prevention.

Technical Stack Summary:
Languages: Python (Pandas, Scikit-learn, Requests), JavaScript (Google Apps Script).

Integrations: SAP ERP, Smartsheet API, Google Drive API, EMS RESTful Services.

Methodologies: OIDC/OAuth2 Authentication, Regex Data Normalization, OOP (Object-Oriented Programming).

Platform: Retool Low-code Integration.

