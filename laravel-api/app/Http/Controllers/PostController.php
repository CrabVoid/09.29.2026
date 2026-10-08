<?php

namespace App\Http\Controllers;

use App\Models\Post;
use App\Models\User;
use Illuminate\Http\Request;

/**
 * CONCEPT: Controller in MVC Architecture
 * A Controller acts as an intermediary between the Model (Database) and the View/Client.
 * It receives incoming HTTP requests, processes data, and returns HTTP responses.
 */
class PostController extends Controller
{
    /**
     * CONCEPT: READ Operation (GET /api/posts)
     * Fetches all posts ordered by newest first.
     * 
     * Method explanation:
     * - `Post::with('status')`: Eager loading relationship to avoid N+1 query performance problems.
     * - `latest()`: Shorthand for `orderBy('created_at', 'desc')`.
     * - `get()`: Executes the database query and returns an Eloquent Collection.
     */
    public function index()
    {
        return Post::with('status')->latest()->get();
    }

    /**
     * CONCEPT: CREATE Operation (POST /api/posts)
     * Validates incoming form/JSON payload and creates a new database record.
     * 
     * Method explanation:
     * - `$request->validate([...])`: Validates client input. If validation fails, Laravel
     *   automatically aborts with a 422 Unprocessable Entity JSON response.
     * - `User::firstOrCreate(...)`: Finds the first user record or creates one if empty.
     * - `Post::create(...)`: Mass assigns properties and performs an SQL INSERT.
     * - `response()->json(..., 201)`: Returns the created post with HTTP 201 Created status code.
     */
    public function store(Request $request)
    {
        // 1. Validate incoming data
        $validatedData = $request->validate([
            'title' => 'required|max:255',
            'body'  => 'required'
        ]);

        // 2. Ensure we have an author user account (Demo fallback)
        $user = User::firstOrCreate(
            ['email' => 'demo@example.com'],
            ['name' => 'Demo User', 'password' => bcrypt('password')]
        );

        // 3. Save post to database
        $post = Post::create([
            'title'          => $validatedData['title'],
            'body'           => $validatedData['body'],
            'user_id'        => $user->id,
            'post_status_id' => 1, // Default to status ID 1 ('public')
        ]);

        return response()->json($post, 201);
    }

    /**
     * CONCEPT: READ Single Item (GET /api/posts/{post})
     * 
     * Method explanation:
     * - Implicit Route Model Binding: Laravel automatically finds the `Post` by ID from URL.
     * - `load('status')`: Loads the related 'status' model dynamically on this instance.
     */
    public function show(Post $post)
    {
        return $post->load('status');
    }

    /**
     * CONCEPT: UPDATE Operation (PUT/PATCH /api/posts/{post})
     * Updates an existing database record.
     * 
     * Method explanation:
     * - `$post->update(...)`: Updates the attributes and performs an SQL UPDATE query.
     */
    public function update(Request $request, Post $post)
    {
        $validatedData = $request->validate([
            'title' => 'required|max:255',
            'body'  => 'required'
        ]);

        $post->update($validatedData);

        return response()->json($post);
    }

    /**
     * CONCEPT: DELETE Operation (DELETE /api/posts/{post})
     * Deletes a record from the database.
     * 
     * Method explanation:
     * - `$post->delete()`: Performs an SQL DELETE query on this record.
     */
    public function destroy(Post $post)
    {
        $post->delete();

        return response()->json([
            'message' => "Post #{$post->id} deleted successfully."
        ]);
    }
}
