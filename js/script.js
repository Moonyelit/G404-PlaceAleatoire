document.addEventListener('DOMContentLoaded', function () {
    /* --- Gestion de l'overlay de bienvenue --- */
    const startButton = document.getElementById('start-button');
    const landingOverlay = document.getElementById('landing-overlay');
    startButton.addEventListener('click', function () {
      landingOverlay.classList.add('slide-up');
      setTimeout(() => {
        landingOverlay.style.display = 'none';
      }, 3000); // durée de la transition en ms
    });
    
    // Configuration des modèles de tables
    const tableModels = [
      { type: 'table', chairPosition: 'top' },
      { type: 'table2', chairPosition: 'right' },
      { type: 'table', chairPosition: 'bottom' },
      { type: 'table2', chairPosition: 'left' }
    ];
    
    // Récupération des éléments DOM
    const grid = document.getElementById('grid');
    const tableOptions = document.getElementById('table-options');
    const studentsTextarea = document.getElementById('students');
    const validateButton = document.getElementById('validate');
    const validatedStudentsList = document.getElementById('validated-students');
    const randomizeButton = document.getElementById('randomize');
    const deleteZoneOriginal = document.getElementById('delete-zone');
    
    // Éléments pour la sauvegarde du plan de classe
    const savePlanButton = document.getElementById('savePlan');
    const planSave1Button = document.getElementById('plan-save-1');
    const planSave2Button = document.getElementById('plan-save-2');
    const planSave3Button = document.getElementById('plan-save-3');
    
    // Éléments pour la sauvegarde de la liste d'élèves
    const saveStudentsButton = document.getElementById('save');
    const savesContainer = document.getElementById('saves-container');
    
    // Variables d'état
    let draggedTable = null;
    let isDragging = false;
    let currentTable = null;
    let currentOffset = { x: 0, y: 0 };
    let validatedStudents = [];
    let isDragAndDrop = false;
    let hasConfirmedExtraTables = false;
    // Pour les plans, nous utilisons désormais un tableau d'objets avec { name, html }
    let planSaves = [null, null, null];
    let studentSaves = [];
    
    // Chargement des sauvegardes depuis localStorage
    const storedPlanSaves = localStorage.getItem('planSaves');
    if (storedPlanSaves) {
      planSaves = JSON.parse(storedPlanSaves);
      for (let i = 0; i < planSaves.length; i++) {
        if (planSaves[i] !== null) {
          document.getElementById(`plan-save-${i+1}`).textContent = `${planSaves[i].name}`;
        }
      }
    }
    const storedStudentSaves = localStorage.getItem('studentSaves');
    if (storedStudentSaves) {
      studentSaves = JSON.parse(storedStudentSaves);
      renderStudentSaves();
    }
    
    // Gestion du drag & drop des modèles de tables
    tableOptions.addEventListener('dragstart', function (e) {
      if (e.target.classList.contains('table-model')) {
        draggedTable = e.target.cloneNode(true);
        e.dataTransfer.setData('text/plain', '');
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
        clone.setAttribute('data-model-index', 0);
        grid.appendChild(clone);
        draggedTable = null;
        reinsertDeleteZone();
      }
    });
    
    // Réinjection de la zone de suppression
    function reinsertDeleteZone() {
      let deleteZone = grid.querySelector('#delete-zone');
      if (!deleteZone) {
        deleteZone = deleteZoneOriginal.cloneNode(true);
        deleteZone.draggable = false;
        deleteZone.style.position = 'absolute';
        deleteZone.style.bottom = '0';
        deleteZone.style.left = '0';
        deleteZone.style.width = '95%';
        deleteZone.style.zIndex = '10';
        deleteZone.addEventListener('mousedown', function(e) { e.stopPropagation(); });
        deleteZone.addEventListener('dragover', function(e) { e.preventDefault(); });
        deleteZone.addEventListener('drop', function(e) {
          e.preventDefault();
          e.stopPropagation();
          if (currentTable) {
            currentTable.style.zIndex = '1000';
            currentTable.style.transition = 'opacity 0.5s';
            currentTable.style.opacity = '0';
            setTimeout(() => {
              currentTable.remove();
              currentTable = null;
            }, 500);
          }
        });
        grid.appendChild(deleteZone);
      }
    }
    
    // Rotation des tables au clic
    grid.addEventListener('click', function (e) {
      if (isDragAndDrop) {
        isDragAndDrop = false;
        return;
      }
      let target = e.target;
      if (target.nodeType === Node.TEXT_NODE) {
        target = target.parentElement;
      }
      const container = target.closest('[data-model-index]');
      if (container) {
        const currentIndex = parseInt(container.getAttribute('data-model-index')) || 0;
        const nextIndex = (currentIndex + 1) % tableModels.length;
        container.setAttribute('data-model-index', nextIndex);
        updateTableModel(container, tableModels[nextIndex]);
      }
    });
    
    // Mise à jour de l'apparence et du contenu d'une table selon le modèle choisi.
    function updateTableModel(container, model) {
      const student = container.getAttribute('data-student');
      container.innerHTML = '';
      const tableDiv = document.createElement('div');
      tableDiv.className = model.type;
      tableDiv.style.width = model.type === 'table' ? '60px' : '40px';
      tableDiv.style.height = model.type === 'table' ? '40px' : '60px';
      tableDiv.style.lineHeight = model.type === 'table' ? '40px' : '60px';
      tableDiv.style.border = '2px solid var(--accent-color)';
      tableDiv.style.borderRadius = '5px';
      tableDiv.style.boxShadow = '3px 3px 10px var(--shadow-color)';
      tableDiv.style.fontFamily = 'var(--font-handwritten)';
      tableDiv.style.textAlign = 'center';
      tableDiv.style.cursor = 'pointer';
    
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
      tableDiv.appendChild(chair);
      if (student) {
        const textNode = document.createTextNode(student);
        tableDiv.appendChild(textNode);
      }
      container.appendChild(tableDiv);
    }
    
    // Gestion du déplacement des tables par souris
    grid.addEventListener('mousedown', function (e) {
      let target = e.target;
      if (target.nodeType === Node.TEXT_NODE) {
        target = target.parentElement;
      }
      const container = target.closest('[data-model-index]');
      if (container) {
        isDragging = true;
        isDragAndDrop = false;
        currentTable = container;
        const rect = grid.getBoundingClientRect();
        currentOffset = {
          x: e.clientX - rect.left - parseFloat(currentTable.style.left || 0),
          y: e.clientY - rect.top - parseFloat(currentTable.style.top || 0)
        };
        e.preventDefault();
      }
    });
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
      if (isDragging && currentTable) {
        const deleteZone = grid.querySelector('#delete-zone');
        const deleteRect = deleteZone.getBoundingClientRect();
        const tableRect = currentTable.getBoundingClientRect();
        if (
          tableRect.left < deleteRect.right &&
          tableRect.right > deleteRect.left &&
          tableRect.top < deleteRect.bottom &&
          tableRect.bottom > deleteRect.top
        ) {
          currentTable.style.zIndex = '1000';
          currentTable.style.transition = 'opacity 0.5s';
          currentTable.style.opacity = '0';
          currentTable.classList.add('deleted');
          setTimeout(() => {
            currentTable.remove();
            currentTable = null;
          }, 500);
        }
      }
      isDragging = false;
      currentTable = null;
    });
    
    // Gestion de la liste d'élèves
    validateButton.addEventListener('click', validateStudents);
    studentsTextarea.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        validateStudents();
      }
    });
    // Valide la liste des élèves en filtrant et ajoutant les noms uniques.
    function validateStudents() {
      const students = studentsTextarea.value.split('\n').filter(name => name.trim() !== '');
      const uniqueStudents = [...new Set(students)];
      validatedStudents = [...new Set([...validatedStudents, ...uniqueStudents])];
      updateValidatedStudentsList();
      studentsTextarea.value = '';
    }
    // Met à jour l'affichage de la liste validée des élèves.
    function updateValidatedStudentsList() {
      validatedStudentsList.innerHTML = '';
      validatedStudents.forEach((student, index) => {
        const li = document.createElement('li');
        li.textContent = student;
        const deleteIcon = document.createElement('span');
        deleteIcon.textContent = ' ❌';
        deleteIcon.style.cursor = 'pointer';
        deleteIcon.style.color = 'white';
        deleteIcon.addEventListener('click', function () {
          deleteStudent(index);
        });
        li.appendChild(deleteIcon);
        validatedStudentsList.appendChild(li);
      });
    }
    // Supprime un élève de la liste validée à partir de son index.
    function deleteStudent(index) {
      validatedStudents.splice(index, 1);
      updateValidatedStudentsList();
    }
    
    // Placement aléatoire des élèves
    randomizeButton.addEventListener('click', function () {
      const tableContainers = Array.from(grid.querySelectorAll('[data-model-index]'))
        .filter(container => !container.classList.contains('deleted'));
      if (validatedStudents.length === 0) {
        alert('Aucun élève validé !');
        return;
      }
      if (tableContainers.length < validatedStudents.length) {
        alert('Il n\'y a pas assez de tables pour tous les élèves !');
        return;
      }
      if (tableContainers.length > validatedStudents.length && !hasConfirmedExtraTables) {
        const confirmPlacement = confirm('Il y a plus de tables que d\'élèves. Voulez-vous continuer ?');
        if (!confirmPlacement) return;
        hasConfirmedExtraTables = true;
      }
      const shuffledContainers = shuffleArray(tableContainers);
      const shuffledStudents = shuffleArray([...validatedStudents]);
      shuffledContainers.forEach((container, index) => {
        const tableElement = container.querySelector('.table, .table2');
        if (tableElement) {
          // Ne supprimer que les nœuds texte afin de conserver l'intégralité (table + chaise)
          Array.from(tableElement.childNodes).forEach(child => {
            if (child.nodeType === Node.TEXT_NODE) {
              tableElement.removeChild(child);
            }
          });
          if (index < shuffledStudents.length) {
            const student = shuffledStudents[index];
            container.setAttribute('data-student', student);
            tableElement.appendChild(document.createTextNode(student));
          } else {
            container.removeAttribute('data-student');
          }
        }
      });
    });
    // Mélange de manière aléatoire les éléments d'un tableau.
    function shuffleArray(array) {
      for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
      }
      return array;
    }
    
    // Réinitialisation des tables chargées et réinjection de la zone de suppression
    // Réinitialise les tables chargées en remettant les attributs par défaut et réinsère la zone de suppression.
    function reinitializeLoadedTables() {
      const loadedContainers = grid.children;
      for (let container of loadedContainers) {
        if (container.id !== 'delete-zone') {
          container.draggable = false;
          container.style.position = 'absolute';
          if (!container.hasAttribute('data-model-index')) {
            container.setAttribute('data-model-index', 0);
          }
        }
      }
      reinsertDeleteZone();
    }
    function reinsertDeleteZone() {
      let deleteZone = grid.querySelector('#delete-zone');
      if (!deleteZone) {
        deleteZone = deleteZoneOriginal.cloneNode(true);
        deleteZone.draggable = false;
        deleteZone.style.position = 'absolute';
        deleteZone.style.bottom = '0';
        deleteZone.style.left = '0';
        deleteZone.style.width = '95%';
        deleteZone.style.zIndex = '10';
        deleteZone.addEventListener('mousedown', function(e) { e.stopPropagation(); });
        deleteZone.addEventListener('dragover', function(e) { e.preventDefault(); });
        deleteZone.addEventListener('drop', function(e) {
          e.preventDefault();
          e.stopPropagation();
          if (currentTable) {
            currentTable.style.zIndex = '1000';
            currentTable.style.transition = 'opacity 0.5s';
            currentTable.style.opacity = '0';
            currentTable.classList.add('deleted');
            setTimeout(() => {
              currentTable.remove();
              currentTable = null;
            }, 500);
          }
        });
        grid.appendChild(deleteZone);
      }
    }
    
    // Sauvegarde du plan de classe avec nommage (similaire aux élèves)
    // Retire la zone de suppression de la grille avant de sauvegarder le plan de classe.
    function removeDeleteZoneFromGrid() {
      const deleteZone = grid.querySelector('#delete-zone');
      if (deleteZone) {
        deleteZone.parentElement.removeChild(deleteZone);
      }
    }
    savePlanButton.addEventListener('click', function() {
      removeDeleteZoneFromGrid();
      let slot = planSaves.findIndex(save => save === null);
      if (slot === -1) {
        let choice = prompt("Tous les emplacements sont utilisés. Entrez le numéro de l'emplacement à écraser (1, 2 ou 3) :");
        if (choice === null) return;
        slot = parseInt(choice, 10) - 1;
        if (slot < 0 || slot > 2) {
          alert("Numéro d'emplacement invalide.");
          return;
        }
      }
      let planName = prompt("Nom de la sauvegarde du plan de classe :", "Sauvegarde " + (slot + 1));
      if (!planName) return;
      // Stocker l'HTML sauvegardé dans un objet { name, html }
      planSaves[slot] = {
        name: planName,
        html: grid.innerHTML
      };
      localStorage.setItem('planSaves', JSON.stringify(planSaves));
      document.getElementById(`plan-save-${slot+1}`).textContent = `${planName} (Sauvegardé)`;
      alert(`Plan de classe sauvegardé dans l'emplacement ${slot+1}.`);
      reinsertDeleteZone();
    });
    
    planSave1Button.addEventListener('click', function() {
      if (planSaves[0] !== null) {
        grid.innerHTML = planSaves[0].html;
        reinitializeLoadedTables();
      } else {
        alert("Aucune sauvegarde dans l'emplacement 1.");
      }
    });
    planSave2Button.addEventListener('click', function() {
      if (planSaves[1] !== null) {
        grid.innerHTML = planSaves[1].html;
        reinitializeLoadedTables();
      } else {
        alert("Aucune sauvegarde dans l'emplacement 2.");
      }
    });
    planSave3Button.addEventListener('click', function() {
      if (planSaves[2] !== null) {
        grid.innerHTML = planSaves[2].html;
        reinitializeLoadedTables();
      } else {
        alert("Aucune sauvegarde dans l'emplacement 3.");
      }
    });
    
    // Sauvegarde de la liste d'élèves (limite 3)
    saveStudentsButton.addEventListener('click', function() {
      if (validatedStudents.length === 0) {
        alert("Aucun élève validé à sauvegarder.");
        return;
      }
      let slot;
      if (studentSaves.length < 3) {
        slot = studentSaves.length;
      } else {
        let choice = prompt("Les 3 emplacements sont utilisés. Entrez le numéro de l'emplacement à écraser (1, 2 ou 3) :");
        if (!choice) return;
        slot = parseInt(choice, 10) - 1;
        if (slot < 0 || slot > 2) {
          alert("Numéro d'emplacement invalide.");
          return;
        }
      }
      const saveName = prompt("Nom de la sauvegarde de la liste d'élèves :", "Sauvegarde " + (slot + 1));
      if (!saveName) return;
      const saveObj = {
        name: saveName,
        students: validatedStudents
      };
      if (studentSaves.length < 3) {
        studentSaves.push(saveObj);
      } else {
        studentSaves[slot] = saveObj;
      }
      localStorage.setItem('studentSaves', JSON.stringify(studentSaves));
      renderStudentSaves();
      alert("Liste d'élèves sauvegardée.");
    });
    function renderStudentSaves() {
      savesContainer.innerHTML = '';
      studentSaves.forEach((save, index) => {
        const btn = document.createElement('button');
        btn.textContent = save.name;
        btn.addEventListener('click', function() {
          validatedStudents = save.students;
          updateValidatedStudentsList();
        });
        savesContainer.appendChild(btn);
      });
    }
  });
