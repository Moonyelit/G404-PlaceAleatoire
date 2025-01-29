document.addEventListener("DOMContentLoaded", () => {
    const tableModels = document.querySelectorAll(".table-model");
    const grid = document.getElementById("grid");
    const studentsInput = document.getElementById("students");
    const validateButton = document.getElementById("validate");
    const randomizeButton = document.getElementById("randomize");
    const saveButton = document.getElementById("save");
    const validatedStudentsList = document.getElementById("validated-students");
    const saveItems = document.querySelectorAll(".save-item");
    let studentList = [];
    let seatingArrangement = [];
    let saves = [null, null, null];

    // Ajout des événements de drag and drop pour les modèles de table
    tableModels.forEach(model => {
        model.addEventListener("dragstart", (event) => {
            event.dataTransfer.setData("text", event.target.dataset.chair);
        });
    });

    // Permet de déposer les tables sur la grille
    grid.addEventListener("dragover", (event) => {
        event.preventDefault();
    });

    grid.addEventListener("drop", (event) => {
        event.preventDefault();
        const chairPosition = event.dataTransfer.getData("text");
        const draggedTableId = event.dataTransfer.getData("tableId");

        if (draggedTableId) {
            const table = document.getElementById(draggedTableId);
            const rect = grid.getBoundingClientRect();
            table.style.left = `${event.clientX - rect.left - 30}px`;
            table.style.top = `${event.clientY - rect.top - 20}px`;
        } else if (chairPosition) {
            const table = createTable(chairPosition, event.clientX, event.clientY);
            grid.appendChild(table);
            addTableEventListeners(table);
        }
    });

    // Validation des prénoms des élèves
    validateButton.addEventListener("click", validateStudents);
    studentsInput.addEventListener("keypress", (event) => {
        if (event.key === "Enter") {
            event.preventDefault();
            validateStudents();
        }
    });

    // Génération aléatoire des placements
    randomizeButton.addEventListener("click", () => {
        if (studentList.length === 0) {
            alert("Veuillez entrer des prénoms d'apprenants.");
            return;
        }
        randomizeSeatingArrangement();
    });

    // Sauvegarde des données
    saveButton.addEventListener("click", () => {
        const saveIndex = prompt("Choisissez une sauvegarde (1, 2 ou 3):");
        if (saveIndex < 1 || saveIndex > 3) {
            alert("Numéro de sauvegarde invalide.");
            return;
        }
        if (saves[saveIndex - 1] && !confirm("Il y a déjà une sauvegarde existante. Voulez-vous l'écraser ?")) {
            return;
        }
        saveData(saveIndex - 1);
    });

    // Chargement des sauvegardes
    saveItems.forEach((saveItem, index) => {
        saveItem.addEventListener("click", () => {
            loadData(index);
        });
    });

    // Fonction pour valider les prénoms des élèves
    function validateStudents() {
        const names = studentsInput.value.split('\n').filter(name => name.trim() !== '');
        if (names.length + studentList.length > 30) {
            alert("Le nombre maximum d'apprenants est de 30.");
            return;
        }
        studentList = studentList.concat(names);
        studentsInput.value = '';
        updateValidatedStudentsList();
    }

    // Mise à jour de la liste des élèves validés
    function updateValidatedStudentsList() {
        validatedStudentsList.innerHTML = '';
        studentList.forEach(student => {
            const li = document.createElement("li");
            li.textContent = student;
            li.style.fontFamily = "var(--font-handwritten)"; // Police crayonnée
            li.style.color = "var(--ink-color)"; // Couleur d'encre
            validatedStudentsList.appendChild(li);
        });
    }

    // Création d'une table avec une chaise
    function createTable(chairPosition, x, y) {
        const table = document.createElement("div");
        table.classList.add(chairPosition === "right" || chairPosition === "left" ? "table2" : "table");
        table.draggable = true;
        table.id = `table-${Date.now()}`;
        table.dataset.chair = chairPosition; // Stocker la position de la chaise
        table.style.position = "absolute";
        table.style.width = chairPosition === "right" || chairPosition === "left" ? "40px" : "60px";
        table.style.height = chairPosition === "right" || chairPosition === "left" ? "60px" : "40px";
        table.style.background = "var(--paper-color)"; // Couleur de papier
        table.style.border = "2px solid var(--accent-color)"; // Bordure marron
        table.style.color = "var(--ink-color)"; // Couleur d'encre
        table.style.textAlign = "center";
        table.style.lineHeight = chairPosition === "right" || chairPosition === "left" ? "60px" : "40px";
        table.style.borderRadius = "5px";
        table.style.cursor = "pointer";
        table.style.boxShadow = "3px 3px 10px var(--shadow-color)"; // Ombre douce

        const rect = grid.getBoundingClientRect();
        table.style.left = `${x - rect.left - 30}px`;
        table.style.top = `${y - rect.top - 20}px`;

        const chair = createChair(chairPosition);
        table.appendChild(chair);

        return table;
    }

    // Création d'une chaise
    function createChair(position) {
        const chair = document.createElement("div");
        chair.classList.add("chair");
        chair.dataset.position = position;
        chair.style.width = "20px";
        chair.style.height = "20px";
        chair.style.background = "var(--paper-color)"; // Couleur de papier
        chair.style.border = "2px solid var(--accent-color)"; // Bordure marron
        chair.style.borderRadius = "50%";
        chair.style.position = "absolute";
        chair.style.boxShadow = "3px 3px 10px var(--shadow-color)"; // Ombre douce

        setChairPosition(chair, position);
        return chair;
    }

    // Positionnement de la chaise par rapport à la table
    function setChairPosition(chair, position) {
        switch (position) {
            case "top":
                chair.style.left = "25px";
                chair.style.top = "-19px";
                break;
            case "right":
                chair.style.left = "48px";
                chair.style.top = "22px";
                break;
            case "bottom":
                chair.style.left = "25px";
                chair.style.top = "45px";
                break;
            case "left":
                chair.style.left = "-18px";
                chair.style.top = "25px";
                break;
        }
    }

    // Ajout des événements aux tables
    function addTableEventListeners(table) {
        table.addEventListener("dragstart", (event) => {
            event.dataTransfer.setData("tableId", table.id);
        });

        table.addEventListener("click", () => {
            const chair = table.querySelector(".chair");
            const currentPosition = chair.dataset.position;
            const newPosition = getNextPosition(currentPosition);
            setChairPosition(chair, newPosition);
            chair.dataset.position = newPosition;
            table.classList.toggle("table");
            table.classList.toggle("table2");
        });
    }

    // Obtenir la prochaine position de la chaise
    function getNextPosition(currentPosition) {
        switch (currentPosition) {
            case "top":
                return "right";
            case "right":
                return "bottom";
            case "bottom":
                return "left";
            case "left":
                return "top";
        }
    }

    function randomizeSeatingArrangement() {
        const tables = Array.from(document.querySelectorAll("#grid .table, #grid .table2"));
        if (tables.length < studentList.length) {
            alert("Pas assez de tables pour tous les élèves.");
            return;
        }

        seatingArrangement = [];
        const shuffledStudents = studentList.slice().sort(() => Math.random() - 0.5);
        const shuffledTables = tables.sort(() => Math.random() - 0.5);

        // Vider les tables avant de les remplir
        tables.forEach(table => {
            const existingStudentText = table.querySelector(".student-name");
            if (existingStudentText) {
                existingStudentText.remove();
            }
        });

        shuffledStudents.forEach((student, index) => {
            const table = shuffledTables[index];
            const chair = table.querySelector(".chair");

            // Ajouter le nom de l'élève sans écraser la chaise
            const studentNameElement = document.createElement("div");
            studentNameElement.classList.add("student-name");
            studentNameElement.textContent = student;
            studentNameElement.style.position = "absolute";
            studentNameElement.style.top = "50%";
            studentNameElement.style.left = "50%";
            studentNameElement.style.transform = "translate(-50%, -50%)";
            studentNameElement.style.color = "var(--ink-color)"; // Couleur d'encre
            studentNameElement.style.fontSize = "12px";
            studentNameElement.style.fontFamily = "var(--font-handwritten)"; // Police crayonnée

            table.appendChild(studentNameElement);

            // Réattacher la chaise si elle existe
            if (chair) {
                table.appendChild(chair);
                setChairPosition(chair, chair.dataset.position);
            }

            // Enregistrer la disposition
            seatingArrangement.push({ student, tableId: table.id, chairPosition: chair.dataset.position });
        });
    }

    // Sauvegarde des données
    function saveData(index) {
        const data = {
            students: studentList,
            seatingArrangement
        };
        saves[index] = data;
        localStorage.setItem(`classroomData${index}`, JSON.stringify(data));
        alert(`Données sauvegardées dans la sauvegarde ${index + 1}.`);
    }

    // Chargement des données sauvegardées
    function loadData(index) {
        const data = saves[index] || JSON.parse(localStorage.getItem(`classroomData${index}`));
        if (!data) {
            alert("Aucune sauvegarde trouvée.");
            return;
        }
        studentList = data.students;
        seatingArrangement = data.seatingArrangement;
        updateValidatedStudentsList();
        loadSeatingArrangement();
        alert(`Données chargées depuis la sauvegarde ${index + 1}.`);
    }

    // Chargement de la disposition des tables et des élèves
    function loadSeatingArrangement() {
        grid.innerHTML = '';
        seatingArrangement.forEach(({ student, tableId, chairPosition }) => {
            const table = createTable(chairPosition, 0, 0);
            table.id = tableId;
            table.textContent = student;
            grid.appendChild(table);
            addTableEventListeners(table);
        });
    }
});