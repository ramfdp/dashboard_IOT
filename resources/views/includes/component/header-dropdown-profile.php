<div class="dropdown-menu dropdown-menu-end me-1">
    <!-- Logout form -->
    <form id="logout-form" action="<?= route('logout') ?>" method="POST" style="display: none;">
        <?= csrf_field() ?>
    </form>

    <!-- Tombol logout -->
    <a href="#" class="dropdown-item" onclick="event.preventDefault(); document.getElementById('logout-form').submit();">
        Log Out
    </a>
</div>
