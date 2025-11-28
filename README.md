     MediNet – Personal Software Process (PSP)

    Este repositorio contiene el desarrollo del proyecto MediNet, una aplicación web para la gestión de citas médicas, desarrollada aplicando las prácticas del Personal Software Process (PSP) para mejorar estimaciones, calidad y control del proceso personal de desarrollo.
    Aquí se almacenan las evidencias del proceso: planificación, mediciones, seguimiento, defectos, métricas finales y conclusiones del proyecto.

        Tecnologías utilizadas

    Frontend
    React
    Vite
    TailwindCSS

    Backend
    Node.js
    Express.js
    
    Base de Datos
    MySQL (XAMPP / phpMyAdmin)
    


        Sobre el PSP (resumen)

    El Personal Software Process (PSP) es un proceso estructurado que ayuda a mejorar la planificación, la estimación del tamaño, la calidad y el control del trabajo individual. Está enfocado en que el desarrollador mida su propio rendimiento para mejorar continuamente.

        Objetivos del PSP
    Mejorar la precisión en estimaciones de tiempo y tamaño.
    Reducir defectos durante el desarrollo.
    Aumentar la calidad final del software.
    Registrar y analizar el proceso personal para progresar.

        Niveles PSP
    
    PSP0 / PSP0.1: Registro de tiempo, tamaño, defectos y creación de estándares.
    PSP1 / PSP1.1: Estimación de tamaño y tiempo, planificación basada en datos.
    PSP2 / PSP2.1: Gestión de calidad, revisiones de diseño y código, análisis de defectos.





        Aplicación del PSP al proyecto MediNet
    Este proyecto incorporó las actividades PSP en cada fase del desarrollo:

        PSP0 – Base del proceso
    Registro de tiempo en Clockify.
    Registro de defectos en GitHub Issues.
    Estándares de codificación para frontend y backend.

        PSP1 – Estimación y Planificación
    Estimación del tamaño del proyecto: 1600 LOC.
    Esfuerzo estimado vs real: 90 horas.
    Planificación por trimestres (Planificación → Diseño → Codificación → QA).

        PSP2 – Calidad y revisiones
    Revisiones de diseño y rutas del backend.
    Revisiones de código antes de pruebas.
    Corrección de 12 defectos detectados.




            Métricas finales

        Métrica                         	    Valor
        Tamaño total del programa	            1600 LOC
        Tiempo total invertido	                90 h
        Defectos totales	                    12
        Defectos corregidos                 	12
        Productividad                       	17.77 LOC/h
        Densidad de defectos	                0.0075 defectos/LOC



        Estructura del Proyecto
        ├── frontend/
        │   ├── src/
        │   ├── public/
        │   └── README.md
        ├── backend/
        │   ├── src/
        │   ├── routes/
        │   └── controllers/
        ├── database/
        │   └── medinet.sql
        ├── PSP/
        │   ├── time_log.xlsx
        │   ├── defect_log.xlsx
        │   ├── size_log.xlsx
        │   └── metrics_report.pdf
        └── README.md

        Lecciones aprendidas
    Una buena planificación reduce mucha improvisación.
    Probar por módulos evita que se acumulen errores al final.
    Llevar registro de tiempos y defectos hace el proceso mucho más claro.
    Integrar frontend–backend–BD exige disciplina y revisiones constantes.

        Conclusión Final
    Aplicar PSP a MediNet permitió tener un proceso más ordenado, datos más claros y una mejor comprensión de cómo mejorar en cada fase. La planificación, las revisiones y la medición continua ayudaron a producir un sistema más estable y con menos defectos.