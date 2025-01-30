document.addEventListener('DOMContentLoaded', function () {
    // Modèles de tables disponibles
    const tableModels = [
        { type: 'table', chairPosition: 'top' }, // Modèle 1
        { type: 'table2', chairPosition: 'right' }, // Modèle 2
        { type: 'table', chairPosition: 'bottom' }, // Modèle 3
        { type: 'table2', chairPosition: 'left' } // Modèle 4
    ];

    // Éléments DOM
    const grid = document.getElementById('grid');
    const tableOptions = document.getElementById('table-options');
    const studentsTextarea = document.getElementById('students');
    const validateButton = document.getElementById('validate');
    const validatedStudentsList = document.getElementById('validated-students');
    const randomizeButton = document.getElementById('randomize');
    const saveButton = document.getElementById('save');
    const savesContainer = document.getElementById('saves-container');

    // Variables globales
    let draggedTable = null;
    let isDragging = false;
    let currentTable = null; // Table actuellement déplacée
    let currentOffset = { x: 0, y: 0 };
    let validatedStudents = [];
    let isDragAndDrop = false; // Pour suivre si un drag-and-drop est en cours

    // Gestion du drag-and-drop pour les modèles de tables
    tableOptions.addEventListener('dragstart', function (e) {
        if (e.target.classList.contains('table-model')) {
            draggedTable = e.target.cloneNode(true);
            e.dataTransfer.setData('text/plain', ''); // Nécessaire pour Firefox
        }
    });

    grid.addEventListener('dragover', function (e) {
        e.preventDefault();
    });

    grid.addEventListener('drop', function (e) {
        e.preventDefault();
        if (draggedTable) {
            const clone = draggedTable.cloneNode(true);
            clone.style.position = 'absolute';
            clone.style.left = `${e.offsetX - clone.offsetWidth / 2}px`;
            clone.style.top = `${e.offsetY - clone.offsetHeight / 2}px`;
            clone.draggable = false;

            // Ajouter un index de modèle par défaut (0) à la table
            clone.setAttribute('data-model-index', 0);
            grid.appendChild(clone);
            draggedTable = null;
        }
    });

    // Rotation des modèles de tables au clic
    grid.addEventListener('click', function (e) {
        if (isDragAndDrop) {
            // Ignorer l'événement click si un drag-and-drop vient d'avoir lieu
            isDragAndDrop = false;
            return;
        }

        const tableElement = e.target.closest('.table, .table2');
        if (tableElement) {
            const parent = tableElement.parentElement;
            const currentIndex = parseInt(parent.getAttribute('data-model-index')) || 0;
            const nextIndex = (currentIndex + 1) % tableModels.length; // Passe au modèle suivant
            parent.setAttribute('data-model-index', nextIndex); // Met à jour l'index du modèle
            updateTableModel(parent, tableModels[nextIndex]);
        }
    });

    // Mise à jour du modèle de table
    function updateTableModel(tableElement, model) {
        tableElement.innerHTML = ''; // Supprime le contenu actuel

        const table = document.createElement('div');
        table.className = model.type;
        table.style.width = model.type === 'table' ? '60px' : '40px';
        table.style.height = model.type === 'table' ? '40px' : '60px';
        table.style.lineHeight = model.type === 'table' ? '40px' : '60px';
        table.style.border = '2px solid var(--accent-color)';
        table.style.borderRadius = '5px';
        table.style.boxShadow = '3px 3px 10px var(--shadow-color)';
        table.style.fontFamily = 'var(--font-handwritten)';
        table.style.textAlign = 'center';
        table.style.cursor = 'pointer';

        const chair = document.createElement('div');
        chair.className = 'chair';
        chair.style.border = '2px solid var(--accent-color)';
        chair.style.borderRadius = '50%';
        chair.style.boxShadow = '3px 3px 10px var(--shadow-color)';
        chair.style.position = 'absolute';

        switch (model.chairPosition) {
            case 'top':
                chair.style.left = '20px';
                chair.style.top = '-17px';
                break;
            case 'right':
                chair.style.left = '35px';
                chair.style.top = '20px';
                break;
            case 'bottom':
                chair.style.left = '20px';
                chair.style.top = '36px';
                break;
            case 'left':
                chair.style.left = '-18px';
                chair.style.top = '20px';
                break;
        }

        table.appendChild(chair);
        tableElement.appendChild(table);
    }

    // Déplacer les tables dans la grille
    grid.addEventListener('mousedown', function (e) {
        const tableElement = e.target.closest('.table, .table2');
        if (tableElement) {
            isDragging = true;
            isDragAndDrop = false; // Réinitialiser l'état du drag-and-drop
            currentTable = tableElement.parentElement; // Stocker la table actuellement déplacée

            // Calculer le décalage entre la souris et la position de la table
            const rect = grid.getBoundingClientRect();
            currentOffset = {
                x: e.clientX - rect.left - parseFloat(currentTable.style.left || 0),
                y: e.clientY - rect.top - parseFloat(currentTable.style.top || 0)
            };

            // Désactiver la sélection de texte pendant le déplacement
            e.preventDefault();
        }
    });

    grid.addEventListener('mousemove', function (e) {
        if (isDragging && currentTable) {
            isDragAndDrop = true; // Un drag-and-drop est en cours
            // Calculer la nouvelle position de la table par rapport à la grille
            const rect = grid.getBoundingClientRect();
            const newX = e.clientX - rect.left - currentOffset.x;
            const newY = e.clientY - rect.top - currentOffset.y;

            // Appliquer la nouvelle position
            currentTable.style.left = `${newX}px`;
            currentTable.style.top = `${newY}px`;
        }
    });

    grid.addEventListener('mouseup', function (e) {
        if (isDragging) {
            isDragging = false;
            currentTable = null; // Réinitialiser la table actuellement déplacée
        }
    });

    // Validation des élèves
    validateButton.addEventListener('click', function () {
        const students = studentsTextarea.value.split('\n').filter(name => name.trim() !== '');
        validatedStudents = [...new Set([...validatedStudents, ...students])]; // Évite les doublons
        updateValidatedStudentsList();
        studentsTextarea.value = ''; // Vide le textarea
    });

    // Mise à jour de la liste des élèves validés
    function updateValidatedStudentsList() {
        validatedStudentsList.innerHTML = '';
        validatedStudents.forEach(student => {
            const li = document.createElement('li');
            li.textContent = student;
            validatedStudentsList.appendChild(li);
        });
    }

    // Placement aléatoire des élèves
    randomizeButton.addEventListener('click', function () {
        const tables = grid.querySelectorAll('.table, .table2');
        tables.forEach(table => {
            if (validatedStudents.length > 0) {
                const randomIndex = Math.floor(Math.random() * validatedStudents.length);
                table.textContent = validatedStudents[randomIndex];
            }
        });
    });

    // Sauvegarde du plan de classe
    saveButton.addEventListener('click', function () {
        const saveName = prompt('Nommez votre sauvegarde :');
        if (saveName) {
            const saveItem = document.createElement('button');
            saveItem.className = 'save-item';
            saveItem.textContent = saveName;
            saveItem.addEventListener('click', function () {
                alert(`Chargement de la sauvegarde : ${saveName}`);
                // Ici, vous pouvez implémenter la logique pour charger la sauvegarde
            });
            savesContainer.appendChild(saveItem);
        }
    });
});