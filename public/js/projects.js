document.addEventListener('DOMContentLoaded', function() {
    // Handle delete button clicks
    document.querySelectorAll('.btn-delete').forEach(button => {
        button.addEventListener('click', async function() {
            const projectId = this.dataset.projectId;
            if (confirm('Are you sure you want to delete this project?')) {
                try {
                    const response = await fetch(`/projects/${projectId}`, {
                        method: 'DELETE'
                    });
                    if (response.ok) {
                        window.location.reload();
                    }
                } catch (error) {
                    console.error('Error:', error);
                    alert('Failed to delete project');
                }
            }
        });
    });

    // Handle edit button clicks
    document.querySelectorAll('.btn-edit').forEach(button => {
        button.addEventListener('click', function() {
            const projectId = this.dataset.projectId;
            window.location.href = `/projects/${projectId}/edit`;
        });
    });
}); 