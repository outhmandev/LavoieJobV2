<?php

namespace App\Http\Controllers\Portal;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\MarketingPost;
use App\Services\SocialMediaService;
use Carbon\Carbon;

class MarketingController extends Controller
{
    protected $socialMediaService;

    public function __construct(SocialMediaService $socialMediaService)
    {
        $this->socialMediaService = $socialMediaService;
    }

    public function dashboard(Request $request)
    {
        $fbStats = $this->socialMediaService->getFacebookPageStats();
        $threadsStats = $this->socialMediaService->getThreadsStats();
        $instagramStats = $this->socialMediaService->getInstagramStats();

        $totalFollowers = $fbStats['followers'] + $threadsStats['followers'] + $instagramStats['followers'];
        $totalReach = $fbStats['reach'] + $threadsStats['reach'] + $instagramStats['reach'];
        
        $publishedCount = MarketingPost::where('status', 'Published')->count();
        $scheduledCount = MarketingPost::where('status', 'Scheduled')->count();

        // recent activity (last 5 posts)
        $recentPosts = MarketingPost::with('creator')->latest()->take(5)->get();

        // top 5 posts (by engagement = likes + comments + shares)
        $topPosts = MarketingPost::with('creator')
            ->selectRaw('marketing_posts.*, (likes + comments + shares) as engagement_score')
            ->orderByDesc('engagement_score')
            ->take(5)
            ->get();

        return Inertia::render('Marketing/Dashboard', [
            'stats' => [
                'totalFollowers' => $totalFollowers,
                'totalReach' => $totalReach,
                'publishedCount' => $publishedCount,
                'scheduledCount' => $scheduledCount,
                'fbFollowers' => $fbStats['followers'],
                'threadsFollowers' => $threadsStats['followers'],
                'instagramFollowers' => $instagramStats['followers'],
                'instagramReach' => $instagramStats['reach']
            ],
            'recentPosts' => $recentPosts,
            'topPosts' => $topPosts
        ]);
    }

    public function calendar(Request $request)
    {
        $posts = MarketingPost::with('creator')
            ->orderBy('scheduled_at', 'asc')
            ->get()
            ->map(function ($post) {
                return [
                    'id' => $post->id,
                    'title' => $post->title,
                    'content' => $post->content,
                    'platform' => $post->platform,
                    'status' => $post->status,
                    'date' => $post->scheduled_at ? $post->scheduled_at->format('Y-m-d') : null,
                    'creator' => $post->creator ? $post->creator->full_name : 'Unknown'
                ];
            });

        return Inertia::render('Marketing/Calendar', [
            'events' => $posts
        ]);
    }

    public function statistics(Request $request)
    {
        // Mock data for charts
        $growthData = [
            ['name' => 'Jan', 'Facebook' => 4000, 'Threads' => 2400],
            ['name' => 'Feb', 'Facebook' => 3000, 'Threads' => 1398],
            ['name' => 'Mar', 'Facebook' => 2000, 'Threads' => 9800],
            ['name' => 'Apr', 'Facebook' => 2780, 'Threads' => 3908],
            ['name' => 'May', 'Facebook' => 1890, 'Threads' => 4800],
            ['name' => 'Jun', 'Facebook' => 2390, 'Threads' => 3800],
            ['name' => 'Jul', 'Facebook' => 3490, 'Threads' => 4300],
        ];

        return Inertia::render('Marketing/Statistics', [
            'growthData' => $growthData
        ]);
    }

    public function team(Request $request)
    {
        $posts = MarketingPost::with(['creator', 'approver', 'publisher'])
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('Marketing/Team', [
            'posts' => $posts
        ]);
    }
}
