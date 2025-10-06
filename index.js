document.addEventListener('DOMContentLoaded', function() {
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('projectDate').value = today;

    const darkModeToggle = document.getElementById('darkModeToggle');
    const htmlElement = document.documentElement;

    if (localStorage.getItem('darkMode') === 'enabled') {
        htmlElement.classList.add('dark');
        darkModeToggle.innerHTML = '<i class="fas fa-sun"></i>';
    } else {
        htmlElement.classList.remove('dark');
        darkModeToggle.innerHTML = '<i class="fas fa-moon"></i>';
    }

    darkModeToggle.addEventListener('click', function() {
        if (htmlElement.classList.contains('dark')) {
            htmlElement.classList.remove('dark');
            localStorage.setItem('darkMode', 'disabled');
            darkModeToggle.innerHTML = '<i class="fas fa-moon"></i>';
        } else {
            htmlElement.classList.add('dark');
            localStorage.setItem('darkMode', 'enabled');
            darkModeToggle.innerHTML = '<i class="fas fa-sun"></i>';
        }
    });

    loadProjects();

    document.getElementById('projectForm').addEventListener('submit', function(e) {
        e.preventDefault();

        const title = document.getElementById('projectTitle').value.trim();
        const description = document.getElementById('projectDescription').value.trim();
        const date = document.getElementById('projectDate').value;
        const completed = document.getElementById('projectCompleted').checked;

        if (title && description && date) {
            addProject(title, description, date, completed);
            this.reset();
            document.getElementById('projectDate').value = today;
            document.getElementById('projectCompleted').checked = false;
        }
    });

    document.getElementById('filterAll').addEventListener('click', () => filterProjects('all'));
    document.getElementById('filterCompleted').addEventListener('click', () => filterProjects('completed'));
    document.getElementById('filterOngoing').addEventListener('click', () => filterProjects('ongoing'));

    document.getElementById('searchInput').addEventListener('input', function() {
        renderProjects(currentFilter, this.value.trim());
    });
});

let currentFilter = 'all';

function addProject(title, description, date, completed) {
    const projects = getProjects();
    const project = {
        id: Date.now(),
        title,
        description,
        date,
        completed,
        createdAt: new Date().toISOString()
    };

    projects.push(project);
    saveProjects(projects);
    renderProjects(currentFilter, document.getElementById('searchInput').value.trim());
}

function getProjects() {
    return JSON.parse(localStorage.getItem('projects') || '[]');
}

function saveProjects(projects) {
    localStorage.setItem('projects', JSON.stringify(projects));
}

function loadProjects() {
    renderProjects();
}

function renderProjects(filter = 'all', searchTerm = '') {
    currentFilter = filter;
    let projects = getProjects();

    if (filter === 'completed') {
        projects = projects.filter(p => p.completed);
    } else if (filter === 'ongoing') {
        projects = projects.filter(p => !p.completed);
    }

    if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        projects = projects.filter(p =>
            p.title.toLowerCase().includes(searchLower) ||
            p.description.toLowerCase().includes(searchLower)
        );
    }

    const projectsList = document.getElementById('projectsList');

    if (projects.length === 0) {
        projectsList.innerHTML = `
            <div class="empty-state text-center py-12 text-gray-500 dark:text-gray-400">
                <i class="fas ${searchTerm ? 'fa-search' : 'fa-inbox'} text-4xl mb-4"></i>
                <p>${searchTerm ? 'No projects match your search.' : 'No projects yet. Start by adding your first project!'}</p>
            </div>
        `;
        return;
    }

    document.querySelectorAll('#filterAll, #filterCompleted, #filterOngoing').forEach(btn => {
        btn.classList.remove('bg-blue-600', 'bg-green-600', 'bg-red-600', 'text-white');
        if (btn.id === 'filterAll' && filter === 'all') btn.classList.add('bg-blue-600', 'text-white');
        if (btn.id === 'filterCompleted' && filter === 'completed') btn.classList.add('bg-green-600', 'text-white');
        if (btn.id === 'filterOngoing' && filter === 'ongoing') btn.classList.add('bg-red-600', 'text-white');
    });

    projectsList.innerHTML = projects.map(project => `
        <div class="project-card bg-white dark:bg-gray-700 border-l-4 ${project.completed ? 'border-green-500' : 'border-orange-500'} rounded-lg p-5 shadow-md hover:shadow-lg">
            <div class="flex justify-between items-start mb-3">
                <h3 class="text-xl font-semibold text-gray-800 dark:text-white">${escapeHtml(project.title)}</h3>
                <button onclick="toggleStatus(${project.id})" class="status-badge px-3 py-1 rounded-full text-xs font-medium ${
                    project.completed ?
                    'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' :
                    'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300'
                } transition-colors">
                    <i class="fas ${project.completed ? 'fa-check-circle' : 'fa-spinner'} mr-1"></i>
                    ${project.completed ? 'Completed' : 'Ongoing'}
                </button>
            </div>
            <p class="text-gray-600 dark:text-gray-300 mb-4">${escapeHtml(project.description)}</p>
            <div class="flex justify-between items-center text-sm text-gray-500 dark:text-gray-400">
                <span><i class="far fa-calendar mr-1"></i>${new Date(project.date).toLocaleDateString()}</span>
                <button onclick="deleteProject(${project.id})" class="text-red-500 dark:text-red-400 hover:text-red-700 transition-colors">
                    <i class="fas fa-trash"></i> Delete
                </button>
            </div>
        </div>
    `).join('');
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function toggleStatus(id) {
    const projects = getProjects();
    const projectIndex = projects.findIndex(p => p.id === id);

    if (projectIndex > -1) {
        projects[projectIndex].completed = !projects[projectIndex].completed;
        saveProjects(projects);
        renderProjects(currentFilter, document.getElementById('searchInput').value.trim());
    }
}

function deleteProject(id) {
    if (confirm('Are you sure you want to delete this project?')) {
        const projects = getProjects().filter(p => p.id !== id);
        saveProjects(projects);
        renderProjects(currentFilter, document.getElementById('searchInput').value.trim());
    }
}

function filterProjects(type) {
    renderProjects(type, document.getElementById('searchInput').value.trim());
}

window.toggleStatus = toggleStatus;
window.deleteProject = deleteProject;
window.filterProjects = filterProjects;
