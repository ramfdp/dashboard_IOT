<?php

namespace App\Http\Controllers;

use App\Models\CCTVCamera;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Exception;

class CCTVController extends Controller
{
    /**
     * Display the CCTV dashboard
     */
    public function index()
    {
        try {
            // Get cameras from database
            $cameras = CCTVCamera::getActiveCameras();
            
            // Convert to array format for blade compatibility
            $cameraData = $cameras->map(function($camera) {
                return [
                    'id' => $camera->id,
                    'name' => $camera->name,
                    'url' => $camera->url,
                    'description' => $camera->description,
                    'location' => $camera->location,
                    'status' => $camera->status,
                    'is_recording' => $camera->is_recording,
                    'settings' => $camera->settings
                ];
            })->toArray();
            
            return view('dashboard-cctv', ['cameras' => $cameraData]);
            
        } catch (Exception $e) {
            Log::error('CCTV Dashboard Error: ' . $e->getMessage());
            
            // Fallback to hardcoded cameras if database fails
            $fallbackCameras = $this->getFallbackCameras();
            
            return view('pages.dashboard-cctv', ['cameras' => $fallbackCameras])
                ->with('error', 'Some features may be limited. Please check system configuration.');
        }
    }
    
    /**
     * Fallback camera configuration
     */
    private function getFallbackCameras()
    {
        return [
            [
                'id' => 1,
                'name' => 'Main Camera',
                'url' => 'http://192.168.30.183:5000/video_feed',
                'description' => 'Main surveillance camera',
                'location' => 'Main Area',
                'status' => 'active'
            ]
        ];
    }
    
    /**
     * Check camera status
     */
    public function checkStatus(Request $request)
    {
        $cameraId = $request->input('camera_id');
        
        try {
            $camera = CCTVCamera::findOrFail($cameraId);
            $status = $camera->getStatus();
            
            return response()->json([
                'success' => true,
                'status' => $status['status'],
                'camera' => $status,
                'last_online' => $status['last_online']
            ]);
            
        } catch (Exception $e) {
            Log::error('Camera Status Check Error: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'status' => 'offline',
                'message' => 'Camera not found or connection failed'
            ]);
        }
    }
    
    /**
     * Get all cameras status
     */
    public function getAllStatus()
    {
        try {
            $cameras = CCTVCamera::getActiveCameras();
            $statusData = [];
            
            foreach ($cameras as $camera) {
                $status = $camera->getStatus();
                $statusData[] = [
                    'id' => $camera->id,
                    'name' => $camera->name,
                    'status' => $status['status'],
                    'last_online' => $status['last_online'],
                    'is_recording' => $status['is_recording']
                ];
            }
            
            $stats = CCTVCamera::getSystemStats();
            
            return response()->json([
                'success' => true,
                'cameras' => $statusData,
                'stats' => $stats
            ]);
            
        } catch (Exception $e) {
            Log::error('Get All Status Error: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to get camera status'
            ], 500);
        }
    }
    
    /**
     * Refresh camera feed
     */
    public function refresh(Request $request)
    {
        $cameraId = $request->input('camera_id');
        
        try {
            $camera = CCTVCamera::findOrFail($cameraId);
            
            $refreshUrl = $camera->getUrlWithTimestamp();
            
            return response()->json([
                'success' => true,
                'message' => 'Camera refreshed successfully',
                'url' => $refreshUrl,
                'timestamp' => now()->timestamp
            ]);
            
        } catch (Exception $e) {
            Log::error('Camera Refresh Error: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to refresh camera'
            ], 500);
        }
    }
    
    /**
     * Get camera details
     */
    public function show($id)
    {
        try {
            $camera = CCTVCamera::findOrFail($id);
            $status = $camera->getStatus();
            $connectionTest = $camera->testConnection();
            
            return response()->json([
                'success' => true,
                'camera' => [
                    'id' => $camera->id,
                    'name' => $camera->name,
                    'url' => $camera->url,
                    'description' => $camera->description,
                    'location' => $camera->location,
                    'status' => $status['status'],
                    'is_recording' => $status['is_recording'],
                    'last_online' => $status['last_online'],
                    'settings' => $camera->settings,
                    'connection_test' => $connectionTest
                ]
            ]);
            
        } catch (Exception $e) {
            Log::error('Camera Show Error: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Camera not found'
            ], 404);
        }
    }
    
    /**
     * Update camera configuration
     */
    public function update(Request $request, $id)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'url' => 'required|url',
            'description' => 'nullable|string',
            'location' => 'nullable|string',
            'status' => 'in:active,inactive,maintenance',
            'settings' => 'nullable|array'
        ]);
        
        try {
            $camera = CCTVCamera::findOrFail($id);
            
            $camera->update([
                'name' => $request->name,
                'url' => $request->url,
                'description' => $request->description,
                'location' => $request->location,
                'status' => $request->status ?? $camera->status,
                'settings' => $request->settings ?? $camera->settings
            ]);
            
            return response()->json([
                'success' => true,
                'message' => 'Camera updated successfully',
                'camera' => $camera->fresh()
            ]);
            
        } catch (Exception $e) {
            Log::error('Camera Update Error: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to update camera'
            ], 500);
        }
    }
    
    /**
     * Create new camera
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'url' => 'required|url',
            'description' => 'nullable|string',
            'location' => 'nullable|string',
            'settings' => 'nullable|array'
        ]);
        
        try {
            $camera = CCTVCamera::create([
                'name' => $request->name,
                'url' => $request->url,
                'description' => $request->description,
                'location' => $request->location,
                'status' => 'active',
                'settings' => $request->settings ?? []
            ]);
            
            return response()->json([
                'success' => true,
                'message' => 'Camera created successfully',
                'camera' => $camera
            ]);
            
        } catch (Exception $e) {
            Log::error('Camera Create Error: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to create camera'
            ], 500);
        }
    }
    
    /**
     * Delete camera
     */
    public function destroy($id)
    {
        try {
            $camera = CCTVCamera::findOrFail($id);
            $camera->delete();
            
            return response()->json([
                'success' => true,
                'message' => 'Camera deleted successfully'
            ]);
            
        } catch (Exception $e) {
            Log::error('Camera Delete Error: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete camera'
            ], 500);
        }
    }
    
    /**
     * Get system statistics
     */
    public function getStats()
    {
        try {
            $stats = CCTVCamera::getSystemStats();
            
            return response()->json([
                'success' => true,
                'stats' => array_merge($stats, [
                    'last_update' => now()->toDateTimeString()
                ])
            ]);
            
        } catch (Exception $e) {
            Log::error('Get Stats Error: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to get statistics'
            ], 500);
        }
    }
    
    /**
     * Test camera connection
     */
    public function testConnection(Request $request)
    {
        $request->validate([
            'camera_id' => 'required|exists:cctv_cameras,id'
        ]);
        
        try {
            $camera = CCTVCamera::findOrFail($request->camera_id);
            $result = $camera->testConnection();
            
            return response()->json([
                'success' => $result['success'],
                'status' => $result['success'] ? 'online' : 'offline',
                'response_time' => $result['response_time'] . 'ms',
                'status_code' => $result['status_code'],
                'message' => $result['message']
            ]);
            
        } catch (Exception $e) {
            Log::error('Test Connection Error: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'status' => 'offline',
                'message' => 'Connection test failed: ' . $e->getMessage()
            ]);
        }
    }
    
    /**
     * Toggle recording
     */
    public function toggleRecording(Request $request, $id)
    {
        try {
            $camera = CCTVCamera::findOrFail($id);
            
            if ($camera->is_recording) {
                $camera->stopRecording();
                $message = 'Recording stopped';
            } else {
                $camera->startRecording();
                $message = 'Recording started';
            }
            
            return response()->json([
                'success' => true,
                'message' => $message,
                'is_recording' => $camera->fresh()->is_recording
            ]);
            
        } catch (Exception $e) {
            Log::error('Toggle Recording Error: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to toggle recording'
            ], 500);
        }
    }
    
    /**
     * Get camera management page
     */
    public function manage()
    {
        try {
            $cameras = CCTVCamera::ordered()->get();
            
            return view('cctv.manage', compact('cameras'));
            
        } catch (Exception $e) {
            Log::error('CCTV Manage Error: ' . $e->getMessage());
            
            return redirect()->back()->with('error', 'Failed to load camera management page');
        }
    }
}