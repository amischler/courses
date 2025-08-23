<?php
declare(strict_types=1);

return [
    'routes' => [
        ['name' => 'page#index', 'url' => '/', 'verb' => 'GET'],
        
        // API routes
        ['name' => 'api#getLists', 'url' => '/api/lists', 'verb' => 'GET'],
        ['name' => 'api#createList', 'url' => '/api/lists', 'verb' => 'POST'],
        ['name' => 'api#updateList', 'url' => '/api/lists/{id}', 'verb' => 'PUT'],
        ['name' => 'api#deleteList', 'url' => '/api/lists/{id}', 'verb' => 'DELETE'],
        
        ['name' => 'api#getItems', 'url' => '/api/lists/{listId}/items', 'verb' => 'GET'],
        ['name' => 'api#createItem', 'url' => '/api/lists/{listId}/items', 'verb' => 'POST'],
        ['name' => 'api#updateItem', 'url' => '/api/items/{id}', 'verb' => 'PUT'],
        ['name' => 'api#deleteItem', 'url' => '/api/items/{id}', 'verb' => 'DELETE'],
        
        ['name' => 'api#getCategories', 'url' => '/api/categories', 'verb' => 'GET'],
        ['name' => 'api#getFrequentItems', 'url' => '/api/frequent-items', 'verb' => 'GET'],
    ]
];