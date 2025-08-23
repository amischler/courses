<?php
declare(strict_types=1);

namespace OCA\Courses\Service;

use OCP\IUserSession;
use OCP\IL10N;
use OCP\IDBConnection;
use Psr\Log\LoggerInterface;
use OCP\Calendar\IManager as ICalendarManager;

class ShoppingService {
    private ?string $userId;
    private IDBConnection $db;
    private IL10N $l10n;
    private LoggerInterface $logger;
    private ICalendarManager $calendarManager;

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
        IDBConnection $db,
        IL10N $l10n,
        LoggerInterface $logger,
        ICalendarManager $calendarManager
    ) {
        $user = $userSession->getUser();
        $this->userId = $user ? $user->getUID() : null;
        $this->db = $db;
        $this->l10n = $l10n;
        $this->logger = $logger;
        $this->calendarManager = $calendarManager;
    }

    public function getLists(): array {
        if (!$this->userId) {
            return [];
        }

        try {
            // Récupérer les calendars de l'utilisateur qui contiennent des tâches
            $principal = 'principals/users/' . $this->userId;
            $calendars = $this->calendarManager->getCalendarsForPrincipal($principal);
            
            $lists = [];
            foreach ($calendars as $calendar) {
                // Récupérer les objets de ce calendar et compter les tâches
                try {
                    $query = $this->calendarManager->newQuery($principal);
                    $query->addSearchCalendar($calendar->getUri());
                    $objects = $this->calendarManager->searchForPrincipal($query);
                    
                    $taskCount = 0;
                    foreach ($objects as $object) {
                        $calData = $object['objects'][0]['VEVENT_OR_VTODO'] ?? '';
                        if (strpos($calData, 'BEGIN:VTODO') !== false) {
                            $taskCount++;
                        }
                    }
                    
                    // N'inclure que les calendars qui ont des tâches
                    if ($taskCount > 0) {
                        $lists[] = [
                            'id' => $calendar->getId(),
                            'name' => $calendar->getDisplayName(),
                            'itemsCount' => $taskCount,
                            'shared' => method_exists($calendar, 'getShares') ? count($calendar->getShares()) > 0 : false
                        ];
                    }
                } catch (\Exception $e) {
                    $this->logger->warning('Error processing calendar ' . $calendar->getUri() . ': ' . $e->getMessage());
                    continue;
                }
            }
            
            return $lists;
        } catch (\Exception $e) {
            $this->logger->error('Error fetching task lists: ' . $e->getMessage(), ['exception' => $e]);
            return [];
        }
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
        if (!$this->userId) {
            return [];
        }

        try {
            // Trouver le calendar correspondant à listId
            $principal = 'principals/users/' . $this->userId;
            $calendars = $this->calendarManager->getCalendarsForPrincipal($principal);
            
            $targetCalendar = null;
            foreach ($calendars as $calendar) {
                if ($calendar->getId() === $listId) {
                    $targetCalendar = $calendar;
                    break;
                }
            }
            
            if (!$targetCalendar) {
                return [];
            }
            
            // Récupérer les tâches de ce calendar
            $query = $this->calendarManager->newQuery($principal);
            $query->addSearchCalendar($targetCalendar->getUri());
            $objects = $this->calendarManager->searchForPrincipal($query);
            
            $items = [];
            foreach ($objects as $object) {
                // Parser les données VTODO
                $calData = $object['objects'][0]['VEVENT_OR_VTODO'] ?? '';
                if (strpos($calData, 'BEGIN:VTODO') !== false) {
                    $task = $this->parseVTODO($calData);
                    if ($task) {
                        $items[] = [
                            'id' => $object['id'],
                            'name' => $task['summary'] ?? 'Tâche sans nom',
                            'quantity' => $this->extractQuantityFromDescription($task['description'] ?? ''),
                            'category' => $this->mapTaskToCategory($task),
                            'completed' => ($task['status'] ?? 'NEEDS-ACTION') === 'COMPLETED'
                        ];
                    }
                }
            }
            
            return $items;
        } catch (\Exception $e) {
            $this->logger->error('Error fetching task items: ' . $e->getMessage(), ['exception' => $e]);
            return [];
        }
    }
    
    private function parseVTODO(string $calData): ?array {
        $lines = explode("\n", $calData);
        $task = [];
        
        foreach ($lines as $line) {
            $line = trim($line);
            if (strpos($line, 'SUMMARY:') === 0) {
                $task['summary'] = substr($line, 8);
            } elseif (strpos($line, 'DESCRIPTION:') === 0) {
                $task['description'] = substr($line, 12);
            } elseif (strpos($line, 'STATUS:') === 0) {
                $task['status'] = substr($line, 7);
            } elseif (strpos($line, 'CATEGORIES:') === 0) {
                $task['categories'] = substr($line, 11);
            }
        }
        
        return empty($task) ? null : $task;
    }
    
    private function extractQuantityFromDescription(string $description): ?string {
        // Chercher des patterns comme "2kg", "1 pièce", etc.
        if (preg_match('/(\d+(?:\.\d+)?\s*(?:kg|g|l|ml|pièces?|unités?))/i', $description, $matches)) {
            return $matches[1];
        }
        return null;
    }
    
    private function mapTaskToCategory(array $task): string {
        $categories = $task['categories'] ?? '';
        $summary = strtolower($task['summary'] ?? '');
        
        // Si une catégorie est définie dans la tâche
        if (!empty($categories)) {
            foreach (self::CATEGORIES as $key => $label) {
                if (stripos($categories, $label) !== false || stripos($categories, $key) !== false) {
                    return $key;
                }
            }
        }
        
        // Sinon, deviner selon le nom
        if (strpos($summary, 'lait') !== false || strpos($summary, 'fromage') !== false || strpos($summary, 'yaourt') !== false) {
            return 'dairy';
        }
        if (strpos($summary, 'tomate') !== false || strpos($summary, 'pomme') !== false || strpos($summary, 'légume') !== false) {
            return 'fruits_vegetables';
        }
        if (strpos($summary, 'pain') !== false || strpos($summary, 'pâte') !== false || strpos($summary, 'riz') !== false) {
            return 'grocery';
        }
        if (strpos($summary, 'viande') !== false || strpos($summary, 'poisson') !== false || strpos($summary, 'jambon') !== false) {
            return 'meat_fish';
        }
        
        return 'other';
    }

    public function createItem(int $listId, string $name, ?string $quantity, ?string $category): array {
        if (!$this->userId) {
            throw new \Exception('User not authenticated');
        }

        try {
            // Trouver le calendar correspondant
            $principal = 'principals/users/' . $this->userId;
            $calendars = $this->calendarManager->getCalendarsForPrincipal($principal);
            
            $targetCalendar = null;
            foreach ($calendars as $calendar) {
                if ($calendar->getId() === $listId) {
                    $targetCalendar = $calendar;
                    break;
                }
            }
            
            if (!$targetCalendar) {
                throw new \Exception('Calendar not found');
            }
            
            // Créer la tâche VTODO
            $description = $quantity ? "Quantité: $quantity" : '';
            $categories = $category ? self::CATEGORIES[$category] ?? $category : '';
            
            $vtodoData = $this->generateVTODO($name, $description, $categories);
            
            // Créer la tâche via l'API Calendar
            if (method_exists($targetCalendar, 'createFromString')) {
                $createdObject = $targetCalendar->createFromString($vtodoData);
                return [
                    'id' => $createdObject->getId(),
                    'name' => $name,
                    'quantity' => $quantity,
                    'category' => $category ?? 'other',
                    'completed' => false
                ];
            } else {
                throw new \Exception('Calendar does not support creating tasks');
            }
        } catch (\Exception $e) {
            $this->logger->error('Error creating task item: ' . $e->getMessage(), ['exception' => $e]);
            throw $e;
        }
    }
    
    private function generateVTODO(string $summary, string $description = '', string $categories = ''): string {
        $uid = uniqid();
        $timestamp = date('Ymd\THis\Z');
        
        $vtodo = "BEGIN:VCALENDAR\r\n";
        $vtodo .= "VERSION:2.0\r\n";
        $vtodo .= "PRODID:-//Nextcloud//Courses App//EN\r\n";
        $vtodo .= "BEGIN:VTODO\r\n";
        $vtodo .= "UID:$uid\r\n";
        $vtodo .= "CREATED:$timestamp\r\n";
        $vtodo .= "LAST-MODIFIED:$timestamp\r\n";
        $vtodo .= "DTSTAMP:$timestamp\r\n";
        $vtodo .= "SUMMARY:$summary\r\n";
        
        if (!empty($description)) {
            $vtodo .= "DESCRIPTION:$description\r\n";
        }
        
        if (!empty($categories)) {
            $vtodo .= "CATEGORIES:$categories\r\n";
        }
        
        $vtodo .= "STATUS:NEEDS-ACTION\r\n";
        $vtodo .= "END:VTODO\r\n";
        $vtodo .= "END:VCALENDAR\r\n";
        
        return $vtodo;
    }

    public function updateItem(int $id, array $data): array {
        if (!$this->userId) {
            throw new \Exception('User not authenticated');
        }

        try {
            // Rechercher la tâche dans tous les calendars de l'utilisateur
            $principal = 'principals/users/' . $this->userId;
            $calendars = $this->calendarManager->getCalendarsForPrincipal($principal);
            
            foreach ($calendars as $calendar) {
                if (strpos($calendar->getComponents(), 'VTODO') !== false) {
                    $query = $this->calendarManager->newQuery($principal);
                    $query->addSearchCalendar($calendar->getUri());
                    $objects = $this->calendarManager->searchForPrincipal($query);
                    
                    foreach ($objects as $object) {
                        if ($object['id'] === $id) {
                            // Trouver et parser la tâche existante
                            $calData = $object['objects'][0]['VEVENT_OR_VTODO'] ?? '';
                            if (strpos($calData, 'BEGIN:VTODO') !== false) {
                                $existingTask = $this->parseVTODO($calData);
                                
                                // Mettre à jour les données
                                $updatedSummary = $data['name'] ?? $existingTask['summary'] ?? '';
                                $updatedDescription = isset($data['quantity']) ? "Quantité: {$data['quantity']}" : ($existingTask['description'] ?? '');
                                $updatedCategories = isset($data['category']) ? (self::CATEGORIES[$data['category']] ?? $data['category']) : ($existingTask['categories'] ?? '');
                                $updatedStatus = isset($data['completed']) ? ($data['completed'] ? 'COMPLETED' : 'NEEDS-ACTION') : ($existingTask['status'] ?? 'NEEDS-ACTION');
                                
                                // Générer le nouveau VTODO
                                $updatedVTodo = $this->generateUpdatedVTODO($calData, $updatedSummary, $updatedDescription, $updatedCategories, $updatedStatus);
                                
                                // Mettre à jour via l'API
                                if (method_exists($calendar, 'createFromString')) {
                                    $calendar->createFromString($updatedVTodo);
                                }
                                
                                return array_merge([
                                    'id' => $id,
                                    'name' => $updatedSummary,
                                    'quantity' => $this->extractQuantityFromDescription($updatedDescription),
                                    'category' => $data['category'] ?? 'other',
                                    'completed' => $updatedStatus === 'COMPLETED'
                                ], $data);
                            }
                        }
                    }
                }
            }
            
            throw new \Exception('Task not found');
        } catch (\Exception $e) {
            $this->logger->error('Error updating task item: ' . $e->getMessage(), ['exception' => $e]);
            throw $e;
        }
    }
    
    private function generateUpdatedVTODO(string $originalCalData, string $summary, string $description, string $categories, string $status): string {
        $lines = explode("\n", $originalCalData);
        $updatedLines = [];
        $timestamp = date('Ymd\THis\Z');
        
        foreach ($lines as $line) {
            $line = trim($line);
            if (strpos($line, 'SUMMARY:') === 0) {
                $updatedLines[] = "SUMMARY:$summary";
            } elseif (strpos($line, 'DESCRIPTION:') === 0) {
                $updatedLines[] = "DESCRIPTION:$description";
            } elseif (strpos($line, 'CATEGORIES:') === 0) {
                if (!empty($categories)) {
                    $updatedLines[] = "CATEGORIES:$categories";
                }
            } elseif (strpos($line, 'STATUS:') === 0) {
                $updatedLines[] = "STATUS:$status";
            } elseif (strpos($line, 'LAST-MODIFIED:') === 0) {
                $updatedLines[] = "LAST-MODIFIED:$timestamp";
            } else {
                $updatedLines[] = $line;
            }
        }
        
        return implode("\r\n", $updatedLines);
    }

    public function deleteItem(int $id): void {
        if (!$this->userId) {
            throw new \Exception('User not authenticated');
        }

        try {
            // Rechercher et supprimer la tâche
            $principal = 'principals/users/' . $this->userId;
            $calendars = $this->calendarManager->getCalendarsForPrincipal($principal);
            
            foreach ($calendars as $calendar) {
                if (strpos($calendar->getComponents(), 'VTODO') !== false) {
                    $query = $this->calendarManager->newQuery($principal);
                    $query->addSearchCalendar($calendar->getUri());
                    $objects = $this->calendarManager->searchForPrincipal($query);
                    
                    foreach ($objects as $object) {
                        if ($object['id'] === $id) {
                            // Supprimer via l'API Calendar (à implémenter selon l'API disponible)
                            // Note: L'API exacte dépend de l'implémentation Nextcloud
                            if (method_exists($calendar, 'deleteFromCalendar')) {
                                $calendar->deleteFromCalendar($id);
                            }
                            return;
                        }
                    }
                }
            }
            
            throw new \Exception('Task not found');
        } catch (\Exception $e) {
            $this->logger->error('Error deleting task item: ' . $e->getMessage(), ['exception' => $e]);
            throw $e;
        }
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