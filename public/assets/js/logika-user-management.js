document.addEventListener('DOMContentLoaded', function () {
    const editUserModal = document.getElementById('editUserModal');
    if (editUserModal) {
        editUserModal.addEventListener('show.bs.modal', function (event) {
            const button = event.relatedTarget;
            const userId = button.getAttribute('data-id');
            const userName = button.getAttribute('data-name');
            const userEmail = button.getAttribute('data-email');
            const userRole = button.getAttribute('data-role');
            const userRoleName = button.getAttribute('data-role-name');

            document.getElementById('edit_name').value = userName;
            document.getElementById('edit_email').value = userEmail;
            if (userRole) {
                document.getElementById('edit_role_id').value = userRole;
            }
            document.getElementById('edit_password').value = '';

            document.getElementById('editUserForm').action = `/user-management/${userId}`;

            // Debug informasi
            console.log('Edit User:', {
                userId,
                userName,
                userEmail,
                userRole,
                userRoleName
            });
        });
    }

    // Delete User Modal (sama seperti sebelumnya)
    const deleteUserModal = document.getElementById('deleteUserModal');
    if (deleteUserModal) {
        deleteUserModal.addEventListener('show.bs.modal', function (event) {
            const button = event.relatedTarget;
            const userId = button.getAttribute('data-id');
            const userName = button.getAttribute('data-name');

            document.getElementById('delete_user_name').textContent = userName;
            document.getElementById('deleteUserForm').action = `/user-management/${userId}`;
        });
    }
});