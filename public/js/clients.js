document.addEventListener('DOMContentLoaded', function() {
    // Handle delete button clicks
    document.querySelectorAll('.btn-delete').forEach(button => {
        button.addEventListener('click', async function() {
            const clientId = this.dataset.clientId;
            if (confirm('Are you sure you want to delete this client?')) {
                try {
                    const response = await fetch(`/clients/${clientId}`, {
                        method: 'DELETE',
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    });

                    if (response.ok) {
                        // Remove the row from the table
                        this.closest('tr').remove();
                        // Reload the page to update the client list
                        window.location.reload();
                    } else {
                        alert('Failed to delete client');
                    }
                } catch (error) {
                    console.error('Error:', error);
                    alert('Failed to delete client');
                }
            }
        });
    });

    // Handle edit button clicks
    document.querySelectorAll('.btn-edit').forEach(button => {
        button.addEventListener('click', function() {
            const clientId = this.dataset.clientId;
            window.location.href = `/clients/${clientId}/edit`;
        });
    });
}); 