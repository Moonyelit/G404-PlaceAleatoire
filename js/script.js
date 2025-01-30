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
    const saveTableOptionsButton = document.getElementById('save-table-options');
    const savesTableOptionsContainer = document.getElementById('saves-table-options-container');

    // Variables globales
    let draggedTable = null;
    let isDragging = false;
    let currentTable = null; // Table actuellement déplacée
    let currentOffset = { x: 0, y: 0 };
    let validatedStudents = [];
    let isDragAndDrop = false; // Pour suivre si un drag-and-drop est en cours
    let hasConfirmedExtraTables = false; // Variable pour suivre la confirmation

    // Charger les sauvegardes depuis le localStorage
    let savedTablePlans = JSON.parse(localStorage.getItem('savedTablePlans')) || [];
    let savedStudentPlans = JSON.parse(localStorage.getItem('savedStudentPlans')) || [];

    // Mettre à jour les listes de sauvegardes au chargement de la page
    updateSavedTablePlansList();
    updateSavedStudentPlansList();

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
    validateButton.addEventListener('click', validateStudents);

    // Ajouter un élève en appuyant sur Entrée
    studentsTextarea.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') {
            e.preventDefault(); // Empêcher le saut de ligne
            validateStudents();
        }
    });

    function validateStudents() {
        const students = studentsTextarea.value.split('\n').filter(name => name.trim() !== '');
        const uniqueStudents = [...new Set(students)]; // Évite les doublons
        validatedStudents = [...new Set([...validatedStudents, ...uniqueStudents])]; // Ajoute les nouveaux élèves
        updateValidatedStudentsList();
        studentsTextarea.value = ''; // Vide le textarea
    }

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
        if (validatedStudents.length === 0) {
            alert('Aucun élève validé !');
            return;
        }

        if (tables.length < validatedStudents.length) {
            alert('Il n\'y a pas assez de tables pour tous les élèves !');
            return;
        }

        if (tables.length > validatedStudents.length && !hasConfirmedExtraTables) {
            const confirmPlacement = confirm('Il y a plus de tables que d\'élèves. Voulez-vous continuer ?');
            if (!confirmPlacement) return;
            hasConfirmedExtraTables = true; // Ne plus afficher le message après confirmation
        }

        // Réinitialiser le texte des tables sans toucher aux chaises
        tables.forEach(table => {
            const chair = table.querySelector('.chair');
            table.textContent = ''; // Efface uniquement le texte, pas les chaises
            if (chair) {
                table.appendChild(chair); // Réajoute la chaise
            }
        });

        // Assigner les élèves aux tables
        const shuffledStudents = shuffleArray([...validatedStudents]);
        tables.forEach((table, index) => {
            if (index < shuffledStudents.length) {
                table.textContent = shuffledStudents[index];
            }
        });
    });

    // Fonction pour mélanger un tableau
    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    // Sauvegarde du plan de classe (tables)
    saveTableOptionsButton.addEventListener('click', function () {
        const saveName = prompt('Nommez votre sauvegarde de tables :');
        if (saveName) {
            const plan = {
                name: saveName,
                tables: Array.from(grid.querySelectorAll('.table, .table2')).map(table => ({
                    type: table.className,
                    chairPosition: table.querySelector('.chair').getAttribute('data-position'),
                    left: table.style.left,
                    top: table.style.top,
                    student: table.textContent
                }))
            };

            // Limiter à 3 sauvegardes maximum
            if (savedTablePlans.length >= 3) {
                savedTablePlans.shift(); // Supprimer la sauvegarde la plus ancienne
            }
            savedTablePlans.push(plan);
            localStorage.setItem('savedTablePlans', JSON.stringify(savedTablePlans));
            updateSavedTablePlansList();
        }
    });

    // Mise à jour de la liste des sauvegardes de tables
    function updateSavedTablePlansList() {
        savesTableOptionsContainer.innerHTML = '';
        savedTablePlans.forEach((plan, index) => {
            const saveItem = document.createElement('button');
            saveItem.className = 'save-item2';
            saveItem.textContent = plan.name;
            saveItem.addEventListener('click', function () {
                loadTablePlan(index);
            });
            savesTableOptionsContainer.appendChild(saveItem);
        });
    }

    // Charger un plan de classe (tables)
    function loadTablePlan(index) {
        const plan = savedTablePlans[index];
        grid.innerHTML = ''; // Vider la grille
    
        plan.tables.forEach(tableData => {
            // Créer l'élément de table
            const tableElement = document.createElement('div');
            tableElement.className = tableData.type;
            tableElement.style.position = 'absolute'; // Position absolue pour le drag-and-drop
            tableElement.style.left = tableData.left; // Appliquer la position X enregistrée
            tableElement.style.top = tableData.top; // Appliquer la position Y enregistrée
            tableElement.textContent = tableData.student;
    
            // Créer la chaise
            const chair = document.createElement('div');
            chair.className = 'chair';
            chair.setAttribute('data-position', tableData.chairPosition);
    
            // Positionner la chaise en fonction de sa position enregistrée
            switch (tableData.chairPosition) {
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
    
            // Ajouter la chaise à la table
            tableElement.appendChild(chair);
    
            // Ajouter la table à la grille
            grid.appendChild(tableElement);
    
            // Réinitialiser le drag-and-drop pour la nouvelle table
            tableElement.addEventListener('mousedown', function (e) {
                if (e.target.classList.contains('table') || e.target.classList.contains('table2')) {
                    isDragging = true;
                    isDragAndDrop = false;
                    currentTable = tableElement;
    
                    const rect = grid.getBoundingClientRect();
                    currentOffset = {
                        x: e.clientX - rect.left - parseFloat(tableElement.style.left || 0),
                        y: e.clientY - rect.top - parseFloat(tableElement.style.top || 0)
                    };
    
                    e.preventDefault();
                }
            });
        });
    
        // Réinitialiser les événements de drag-and-drop pour la grille
        grid.addEventListener('mousemove', function (e) {
            if (isDragging && currentTable) {
                isDragAndDrop = true;
                const rect = grid.getBoundingClientRect();
                const newX = e.clientX - rect.left - currentOffset.x;
                const newY = e.clientY - rect.top - currentOffset.y;
    
                currentTable.style.left = `${newX}px`;
                currentTable.style.top = `${newY}px`;
            }
        });
    
        grid.addEventListener('mouseup', function (e) {
            if (isDragging) {
                isDragging = false;
                currentTable = null;
            }
        });
    }

    // Sauvegarde du plan de classe (élèves)
    saveButton.addEventListener('click', function () {
        const saveName = prompt('Nommez votre sauvegarde d\'élèves :');
        if (saveName) {
            const plan = {
                name: saveName,
                students: [...validatedStudents]
            };

            // Limiter à 3 sauvegardes maximum
            if (savedStudentPlans.length >= 3) {
                savedStudentPlans.shift(); // Supprimer la sauvegarde la plus ancienne
            }
            savedStudentPlans.push(plan);
            localStorage.setItem('savedStudentPlans', JSON.stringify(savedStudentPlans));
            updateSavedStudentPlansList();
        }
    });

    // Mise à jour de la liste des sauvegardes d'élèves
    function updateSavedStudentPlansList() {
        savesContainer.innerHTML = '';
        savedStudentPlans.forEach((plan, index) => {
            const saveItem = document.createElement('button');
            saveItem.className = 'save-item';
            saveItem.textContent = plan.name;
            saveItem.addEventListener('click', function () {
                loadStudentPlan(index);
            });
            savesContainer.appendChild(saveItem);
        });
    }

    // Charger un plan de classe (élèves)
    function loadStudentPlan(index) {
        const plan = savedStudentPlans[index];
        validatedStudents = [...plan.students];
        updateValidatedStudentsList();
    }

    // Supprimer une table
    grid.addEventListener('dblclick', function (e) {
        const tableElement = e.target.closest('.table, .table2');
        if (tableElement) {
            tableElement.remove();
        }
    });
});