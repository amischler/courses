<?php
declare(strict_types=1);

namespace OCA\Courses\Controller;

use OCP\AppFramework\Controller;
use OCP\AppFramework\Http\JSONResponse;
use OCP\IRequest;
use OCA\Courses\Service\ShoppingService;

class ApiController extends Controller {
    private ShoppingService $service;

    public function __construct(
        string $appName,
        IRequest $request,
        ShoppingService $service
    ) {
        parent::__construct($appName, $request);
        $this->service = $service;
    }

    /**
     * @NoAdminRequired
     * @NoCSRFRequired
     */
    public function getLists(): JSONResponse {
        return new JSONResponse($this->service->getLists());
    }

    /**
     * @NoAdminRequired
     */
    public function createList(string $name): JSONResponse {
        return new JSONResponse($this->service->createList($name));
    }

    /**
     * @NoAdminRequired
     */
    public function updateList(int $id, string $name): JSONResponse {
        return new JSONResponse($this->service->updateList($id, $name));
    }

    /**
     * @NoAdminRequired
     */
    public function deleteList(int $id): JSONResponse {
        $this->service->deleteList($id);
        return new JSONResponse(['success' => true]);
    }

    /**
     * @NoAdminRequired
     * @NoCSRFRequired
     */
    public function getItems(int $listId): JSONResponse {
        return new JSONResponse($this->service->getItems($listId));
    }

    /**
     * @NoAdminRequired
     */
    public function createItem(int $listId, string $name, ?string $quantity = null, ?string $category = null): JSONResponse {
        return new JSONResponse($this->service->createItem($listId, $name, $quantity, $category));
    }

    /**
     * @NoAdminRequired
     */
    public function updateItem(int $id, array $data): JSONResponse {
        return new JSONResponse($this->service->updateItem($id, $data));
    }

    /**
     * @NoAdminRequired
     */
    public function deleteItem(int $id): JSONResponse {
        $this->service->deleteItem($id);
        return new JSONResponse(['success' => true]);
    }

    /**
     * @NoAdminRequired
     * @NoCSRFRequired
     */
    public function getCategories(): JSONResponse {
        return new JSONResponse($this->service->getCategories());
    }

    /**
     * @NoAdminRequired
     * @NoCSRFRequired
     */
    public function getFrequentItems(): JSONResponse {
        return new JSONResponse($this->service->getFrequentItems());
    }
}