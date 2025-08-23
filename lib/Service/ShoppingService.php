<?php
declare(strict_types=1);

namespace OCA\Courses\Service;

use OCP\IUserSession;
use OCA\Tasks\Service\TasksService;
use OCP\IL10N;

class ShoppingService {
    private ?string $userId;
    private TasksService $tasksService;
    private IL10N $l10n;

    private const CATEGORIES = [
        'fruits_vegetables' => 'Fruits & Légumes',
        'meat_fish' => 'Viandes & Poissons',
        'dairy' => 'Produits laitiers',
        'grocery' => 'Épicerie',
        'beverages' => 'Boissons',
        'hygiene' => 'Hygiène & Beauté',
        'household' => 'Entretien',
        'other' => 'Autres'
    ];

    public function __construct(
        IUserSession $userSession,
        TasksService $tasksService,
        IL10N $l10n
    ) {
        $user = $userSession->getUser();
        $this->userId = $user ? $user->getUID() : null;
        $this->tasksService = $tasksService;
        $this->l10n = $l10n;
    }

    public function getLists(): array {
        // Utiliser l'API Tasks pour récupérer les listes
        // Pour l'instant, retourner des données mockées
        return [
            [
                'id' => 1,
                'name' => 'Courses de la semaine',
                'itemsCount' => 12,
                'shared' => false
            ],
            [
                'id' => 2,
                'name' => 'BBQ Samedi',
                'itemsCount' => 8,
                'shared' => true
            ]
        ];
    }

    public function createList(string $name): array {
        // Créer une nouvelle liste via l'API Tasks
        return [
            'id' => 3,
            'name' => $name,
            'itemsCount' => 0,
            'shared' => false
        ];
    }

    public function updateList(int $id, string $name): array {
        // Mettre à jour la liste
        return [
            'id' => $id,
            'name' => $name,
            'itemsCount' => 0,
            'shared' => false
        ];
    }

    public function deleteList(int $id): void {
        // Supprimer la liste via l'API Tasks
    }

    public function getItems(int $listId): array {
        // Récupérer les items d'une liste
        // Pour l'instant, retourner des données mockées
        return [
            [
                'id' => 1,
                'name' => 'Tomates',
                'quantity' => '1kg',
                'category' => 'fruits_vegetables',
                'completed' => false
            ],
            [
                'id' => 2,
                'name' => 'Pain',
                'quantity' => '2',
                'category' => 'grocery',
                'completed' => true
            ]
        ];
    }

    public function createItem(int $listId, string $name, ?string $quantity, ?string $category): array {
        return [
            'id' => rand(100, 999),
            'name' => $name,
            'quantity' => $quantity,
            'category' => $category ?? 'other',
            'completed' => false
        ];
    }

    public function updateItem(int $id, array $data): array {
        // Mettre à jour un item
        return array_merge(['id' => $id], $data);
    }

    public function deleteItem(int $id): void {
        // Supprimer un item
    }

    public function getCategories(): array {
        $categories = [];
        foreach (self::CATEGORIES as $key => $label) {
            $categories[] = [
                'id' => $key,
                'label' => $this->l10n->t($label)
            ];
        }
        return $categories;
    }

    public function getFrequentItems(): array {
        // Analyser l'historique pour retourner les items fréquents
        return [
            ['name' => 'Lait', 'category' => 'dairy', 'frequency' => 0.8],
            ['name' => 'Pain', 'category' => 'grocery', 'frequency' => 0.75],
            ['name' => 'Tomates', 'category' => 'fruits_vegetables', 'frequency' => 0.6],
            ['name' => 'Oeufs', 'category' => 'dairy', 'frequency' => 0.55],
        ];
    }
}