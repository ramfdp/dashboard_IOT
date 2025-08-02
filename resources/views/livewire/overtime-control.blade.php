<div>
    <!-- BEGIN Enhanced Form Lembur Section -->
    <div class="row">
        <div class="col-md-12">
            <div class="panel panel-inverse">
                <div class="panel-heading">
                    <h1 class="page-header">Timer Lembur</h1>
                </div>

                <div class="panel-body">
                    @if (session()->has('success_overtime'))
                        <div class="alert alert-success">
                            {{ session('success_overtime') }}
                        </div>
                    @endif

                    @if (session()->has('error_overtime'))
                        <div class="alert alert-danger">
                            {{ session('error_overtime') }}
                        </div>
                    @endif

                    <!-- System Availability Status -->
                    @if(!$overtimeAvailable)
                        <div class="alert alert-warning">
                            <h5><i class="fas fa-clock"></i> Sistem Lembur Tidak Tersedia</h5>
                            <p class="mb-1">
                                @if($scheduleEndTime)
                                    <strong>Scheduler lampu aktif hingga {{ $scheduleEndTime }}</strong>
                                @endif
                            </p>
                            @if($minutesUntilAvailable > 0)
                                <p class="mb-0">
                                    <i class="fas fa-hourglass-half"></i> 
                                    Sistem lembur akan tersedia dalam <strong>{{ $minutesUntilAvailable }} menit</strong> setelah scheduler selesai.
                                </p>
                            @endif
                        </div>
                    @else
                        <div class="alert alert-success">
                            <h5><i class="fas fa-check-circle"></i> Sistem Lembur Tersedia</h5>
                            <p class="mb-0">Scheduler lampu tidak aktif. Anda dapat menggunakan fitur lembur.</p>
                        </div>
                    @endif
                    
                    <form wire:submit="store" id="overtime-form">
                        <fieldset {{ !$overtimeAvailable ? 'disabled' : '' }}>
                        <div class="row mb-3">
                            <div class="col-md-6">
                                <div class="form-group mb-3">
                                    <label for="division_name" class="form-label">Divisi</label>
                                    <input type="text" wire:model="division_name" id="division_name" 
                                           class="form-control @error('division_name') is-invalid @enderror" required>
                                    @error('division_name')
                                        <div class="invalid-feedback">{{ $message }}</div>
                                    @enderror
                                </div>
                            </div>

                            <div class="col-md-6">
                                <div class="form-group mb-3">
                                    <label for="employee_name" class="form-label">Nama Karyawan</label>
                                    <input type="text" wire:model="employee_name" id="employee_name" 
                                           class="form-control @error('employee_name') is-invalid @enderror" required>
                                    @error('employee_name')
                                        <div class="invalid-feedback">{{ $message }}</div>
                                    @enderror
                                </div>
                            </div>
                        </div>

                        <div class="row mb-3">
                            <div class="col-md-4">
                                <div class="form-group mb-3">
                                    <label for="overtime_date" class="form-label">Tanggal Lembur</label>
                                    <input type="date" wire:model="overtime_date" id="overtime_date" 
                                           class="form-control @error('overtime_date') is-invalid @enderror" required>
                                    @error('overtime_date')
                                        <div class="invalid-feedback">{{ $message }}</div>
                                    @enderror
                                </div>
                            </div>

                            <div class="col-md-4">
                                <div class="form-group mb-3">
                                    <label for="start_time" class="form-label">Waktu Mulai</label>
                                    <input type="time" wire:model="start_time" id="start_time" 
                                           class="form-control @error('start_time') is-invalid @enderror" required>
                                    @error('start_time')
                                        <div class="invalid-feedback">{{ $message }}</div>
                                    @enderror
                                </div>
                            </div>

                            <div class="col-md-4">
                                <div class="form-group mb-3">
                                    <label for="end_time" class="form-label">Waktu Selesai</label>
                                    <input type="time" wire:model="end_time" id="end_time" 
                                           class="form-control @error('end_time') is-invalid @enderror">
                                    @error('end_time')
                                        <div class="invalid-feedback">{{ $message }}</div>
                                    @enderror
                                    <div class="form-text">Kosongkan jika akan diatur otomatis atau manual cut-off</div>
                                </div>
                            </div>
                        </div>

                        <div class="form-group mb-3">
                            <label for="notes" class="form-label">Catatan</label>
                            <textarea wire:model="notes" id="notes" 
                                      class="form-control @error('notes') is-invalid @enderror" 
                                      rows="3" placeholder="Catatan tambahan (opsional)"></textarea>
                            @error('notes')
                                <div class="invalid-feedback">{{ $message }}</div>
                            @enderror
                        </div>

                        <div class="form-group mb-3">
                            <label for="light_selection" class="form-label">Pilih Lampu yang Akan Dinyalakan</label>
                            <select wire:model="light_selection" id="light_selection" 
                                    class="form-control @error('light_selection') is-invalid @enderror" required>
                                <option value="">-- Pilih Lampu --</option>
                                <option value="itms1">ITMS 1 Light (Relay 1)</option>
                                <option value="itms2">ITMS 2 Light (Relay 2)</option>
                                <option value="all">Semua Lampu (ITMS 1 & 2)</option>
                            </select>
                            @error('light_selection')
                                <div class="invalid-feedback">{{ $message }}</div>
                            @enderror
                            <div class="form-text">Pilih lampu mana yang akan dinyalakan selama lembur</div>
                        </div>

                        <div class="form-group mb-4">
                            <button type="submit" class="btn btn-primary" 
                                    wire:loading.attr="disabled" 
                                    {{ !$overtimeAvailable ? 'disabled' : '' }}>
                                <span wire:loading.remove>
                                    <i class="fas fa-save"></i> {{ $editMode ? 'Update' : 'Simpan' }}
                                </span>
                                <span wire:loading>
                                    <i class="fas fa-spinner fa-spin"></i> {{ $editMode ? 'Mengupdate...' : 'Menyimpan...' }}
                                </span>
                            </button>
                            @if($editMode)
                                <button type="button" wire:click="cancelEdit" class="btn btn-secondary">
                                    <i class="fas fa-times"></i> Batal
                                </button>
                            @endif
                        </div>
                        </fieldset>
                    </form>

                    <hr>

                    <div class="d-flex justify-content-between align-items-center mb-3">
                        <h4>Daftar Lembur</h4>
                        <div class="btn-group">
                            <button type="button" class="btn btn-success btn-sm" wire:click="forceStatusCheck" wire:loading.attr="disabled">
                                <span wire:loading.remove wire:target="forceStatusCheck">
                                    <i class="fas fa-clock"></i> Check Status
                                </span>
                                <span wire:loading wire:target="forceStatusCheck">
                                    <i class="fas fa-spinner fa-spin"></i> Checking...
                                </span>
                            </button>
                            <button type="button" class="btn btn-info btn-sm" wire:click="updateLemburStatusDanRelay" wire:loading.attr="disabled">
                                <span wire:loading.remove wire:target="updateLemburStatusDanRelay">
                                    <i class="fas fa-sync"></i> Refresh
                                </span>
                                <span wire:loading wire:target="updateLemburStatusDanRelay">
                                    <i class="fas fa-spinner fa-spin"></i> Refreshing...
                                </span>
                            </button>
                            <button type="button" class="btn btn-warning btn-sm" wire:click="resetToAutoMode" wire:loading.attr="disabled">
                                <span wire:loading.remove wire:target="resetToAutoMode">
                                    <i class="fas fa-magic"></i> Reset Auto Mode
                                </span>
                                <span wire:loading wire:target="resetToAutoMode">
                                    <i class="fas fa-spinner fa-spin"></i> Resetting...
                                </span>
                            </button>
                        </div>
                    </div>

                    <div class="table-responsive">
                        <table class="table table-bordered table-striped table-hover">
                            <thead class="table-dark">
                                <tr>
                                    <th width="4%">No</th>
                                    <th width="10%">Divisi</th>
                                    <th width="10%">Nama Karyawan</th>
                                    <th width="8%">Tanggal</th>
                                    <th width="7%">Mulai</th>
                                    <th width="7%">Selesai</th>
                                    <th width="7%">Durasi</th>
                                    <th width="8%">Status</th>
                                    <th width="10%">Lampu</th>
                                    <th width="10%">Catatan</th>
                                    <th width="14%">Aksi</th>
                                </tr>
                            </thead>
                            <tbody id="lembur-tbody">
                                @forelse($overtimes as $index => $ot)
                                    <tr>
                                        <td>{{ $loop->iteration + ($overtimes->currentPage() - 1) * $overtimes->perPage() }}</td>
                                        <td>{{ $ot->division_name }}</td>
                                        <td>{{ $ot->employee_name }}</td>
                                        <td>{{ \Carbon\Carbon::parse($ot->overtime_date)->format('d-m-Y') }}</td>
                                        <td>{{ \Carbon\Carbon::parse($ot->start_time)->format('H:i') }}</td>
                                        <td>{{ $ot->end_time ? \Carbon\Carbon::parse($ot->end_time)->format('H:i') : '-' }}</td>
                                        <td>{{ $ot->duration ? $ot->duration . ' menit' : '-' }}</td>
                                        <td>
                                            @if ($ot->status == 0)
                                                <span class="badge bg-secondary">Belum Mulai</span>
                                            @elseif ($ot->status == 1)
                                                <span class="badge bg-warning text-dark">Sedang Berjalan</span>
                                            @else
                                                <span class="badge bg-success">Selesai</span>
                                            @endif
                                        </td>
                                        <td>
                                            @php
                                                $lightSelection = $ot->light_selection ?? 'all';
                                                $lightText = match($lightSelection) {
                                                    'itms1' => '<span class="badge bg-info">ITMS 1</span>',
                                                    'itms2' => '<span class="badge bg-warning">ITMS 2</span>',
                                                    'all' => '<span class="badge bg-success">Semua</span>',
                                                    default => '<span class="badge bg-secondary">Semua</span>'
                                                };
                                            @endphp
                                            {!! $lightText !!}
                                        </td>
                                        <td>{{ $ot->notes ?? '-' }}</td>
                                        <td>
                                            <div class="btn-group-vertical" role="group">
                                                <div class="btn-group mb-1">
                                                    <button type="button" class="btn btn-sm btn-primary" 
                                                            wire:click="editOvertime({{ $ot->id }})" title="Edit">
                                                        <i class="fas fa-edit"></i>
                                                    </button>
                                                    <button type="button" class="btn btn-sm btn-danger" 
                                                            wire:click="deleteOvertime({{ $ot->id }})" 
                                                            wire:confirm="Apakah Anda yakin ingin menghapus data lembur ini?" 
                                                            title="Delete">
                                                        <i class="fas fa-trash"></i>
                                                    </button>
                                                </div>
                                                <div class="btn-group">
                                                    @if ($ot->status == 1)
                                                        <button type="button" class="btn btn-sm btn-warning" 
                                                                wire:click="cutOffOvertime({{ $ot->id }})" title="Cut-off">
                                                            <i class="fas fa-stop"></i>
                                                        </button>
                                                    @elseif ($ot->status == 0)
                                                        <button type="button" class="btn btn-sm btn-success" 
                                                                wire:click="startOvertime({{ $ot->id }})" 
                                                                title="{{ $overtimeAvailable ? 'Start' : 'Tidak tersedia - Scheduler lampu aktif' }}"
                                                                {{ !$overtimeAvailable ? 'disabled' : '' }}>
                                                            <i class="fas fa-play"></i>
                                                        </button>
                                                    @endif
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                @empty
                                    <tr>
                                        <td colspan="11" class="text-center">Belum ada data lembur.</td>
                                    </tr>
                                @endforelse
                            </tbody>
                        </table>
                    </div>

                    <!-- Pagination -->
                    <div class="mt-3">
                        {{ $overtimes->links() }}
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Modal untuk konfirmasi cut-off -->
    @if($showCutOffModal)
        <div class="modal fade show" style="display: block;" tabindex="-1" 
             aria-labelledby="cutOffModalLabel" aria-hidden="true">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="cutOffModalLabel">Konfirmasi Cut-off Lembur</h5>
                        <button type="button" class="btn-close" wire:click="closeCutOffModal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <p>Apakah Anda yakin ingin menghentikan lembur ini sekarang?</p>
                        <p class="text-muted">Waktu selesai akan diatur ke waktu saat ini dan status akan berubah menjadi "Selesai".</p>
                        <div class="mb-3">
                            <label for="cutoff_reason" class="form-label">Alasan Cut-off</label>
                            <textarea class="form-control" wire:model="cutoff_reason" 
                                      rows="3" placeholder="Alasan menghentikan lembur lebih awal..."></textarea>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" wire:click="closeCutOffModal">Batal</button>
                        <button type="button" class="btn btn-warning" wire:click="confirmCutOff">Ya, Hentikan</button>
                    </div>
                </div>
            </div>
        </div>
        <div class="modal-backdrop fade show"></div>
    @endif
    <!-- END Enhanced Form Lembur Section -->

    <!-- Auto-refresh script for backend status checking -->
    <script>
        document.addEventListener('DOMContentLoaded', function() {
            // Auto-check for status changes every 30 seconds
            setInterval(function() {
                @this.call('checkForAutomaticStatusChanges');
            }, 30000);
            
            // Initial check after page load
            setTimeout(function() {
                @this.call('checkForAutomaticStatusChanges');
            }, 3000);
        });
    </script>

    <!-- CSS untuk Indikator -->
    <style>
        .indicator {
            transition: background-color 0.3s ease; 
        }
    </style>
</div>
