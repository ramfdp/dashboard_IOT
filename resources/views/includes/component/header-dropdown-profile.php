<div class="dropdown-menu dropdown-menu-end me-1">
    <a href="javascript:;" class="dropdown-item">Edit Profile</a>
    <a href="javascript:;" class="dropdown-item d-flex align-items-center">
        Inbox
        <span class="badge bg-danger rounded-pill ms-auto pb-4px">2</span>
    </a>
    <a href="javascript:;" class="dropdown-item">Calendar</a>
    <a href="javascript:;" class="dropdown-item">Setting</a>
    <div class="dropdown-divider"></div>

    <!-- Logout form -->
    <form id="logout-form" action="<?= route('logout') ?>" method="POST" style="display: none;">
        <?= csrf_field() ?>
    </form>

    <!-- Tombol logout -->
    <a href="#" class="dropdown-item" onclick="event.preventDefault(); document.getElementById('logout-form').submit();">
        Log Out
    </a>
</div>
