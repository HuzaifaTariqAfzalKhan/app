import { Component, Injectable, OnInit } from '@angular/core';
import { MatTreeFlatDataSource, MatTreeFlattener } from '@angular/material/tree';
import { TreeDataService } from './tree-data.service';
import { FlatTreeControl } from '@angular/cdk/tree';
import { BehaviorSubject } from 'rxjs';
import { NewItemDialogComponent } from '../new-item-dialog/new-item-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { EditItemDialogComponent } from '../edit-item-dialog/edit-item-dialog.component';

export class TodoItemNode {
  children!: TodoItemNode[];
  name!: string;
  parent!: TodoItemNode | null;
  id!: number;
  quantity?: string; // Add quantity as an optional property
  unit?: string; // Add unit as an optional property
}

export class TodoItemFlatNode {
  id!: number;
  name!: string;
  level!: number;
  expandable!: boolean;
  deletable!: boolean;
  isExpanded!: boolean;
  children: any;
  parent!: TodoItemNode | null;
}

@Injectable()
export class ChecklistDatabase {
  dataChange = new BehaviorSubject<TodoItemNode[]>([]);

  get data(): TodoItemNode[] {
    return this.dataChange.value;
  }

  constructor() {
    this.initialize();
  }

  initialize() {
    // Notify the change.
    this.dataChange.next([]);
  }

  insertItem(parent: TodoItemNode, name: string) {
    if (parent.children) {
      parent.children.push({ name } as TodoItemNode);
      this.dataChange.next(this.data);
    }
  }

  insertRoot(name: string) {
    this.data.push({ name } as TodoItemNode);
    this.dataChange.next(this.data);
  }

  updateItem(updatedItem: TodoItemNode) {
    // Implement logic to update item in the database
    // Call the API service's updateItem method to send the PUT request
    // You can handle the response or error as needed

    // Update the local data for immediate UI update
    const index = this.data.findIndex((item) => item.id === updatedItem.id);
    if (index !== -1) {
      this.data[index] = updatedItem;
      this.dataChange.next(this.data);
    }
  }
}

@Component({
  selector: 'app-tree',
  templateUrl: './tree.component.html',
  providers: [ChecklistDatabase],
})
export class TreeComponent implements OnInit {
  treeControl: FlatTreeControl<TodoItemFlatNode>;
  treeFlattener: MatTreeFlattener<TodoItemNode, TodoItemFlatNode>;
  dataSource: MatTreeFlatDataSource<TodoItemNode, TodoItemFlatNode>;

  constructor(private _database: ChecklistDatabase, private treeDataService: TreeDataService, private dialog: MatDialog) {
    this.treeFlattener = new MatTreeFlattener(
      this.transformer,
      (node) => node.level,
      (node) => node.expandable,
      (node) => node.children
    );

    this.treeControl = new FlatTreeControl<TodoItemFlatNode>(
      (node) => node.level,
      (node) => node.expandable
    );

    this.dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);

    this.treeDataService.fetchDataFromApi().subscribe((data: TodoItemNode[]) => {
      this.dataSource.data = data;
    });
  }

  hasChild = (_: number, _nodeData: TodoItemFlatNode) => _nodeData.expandable;

  ngOnInit(): void { }

  transformer = (node: TodoItemNode, level: number) => {
    return {
      id: node.id,
      name: node.name,
      level: level,
      expandable: !!node.children && node.children.length > 0,
      deletable: node.parent !== null,
      isExpanded: false,
    } as TodoItemFlatNode; // Cast the return value to TodoItemFlatNode
  };

  toggleNode(node: TodoItemFlatNode): void {
    node.isExpanded = !node.isExpanded;
    this.treeControl.expandDescendants(node);
  }

  addNewItem(node: TodoItemFlatNode): void {
    // Open the MatDialog
    const dialogRef = this.dialog.open(NewItemDialogComponent, {
      width: '300px', // Adjust the width as needed
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // Create the new item
        const newItem: TodoItemNode = {
          id: Math.floor(Math.random() * 1000), // Generate a unique ID
          name: result.name,
          quantity: result.quantity,
          unit: result.unit,
          parent: node,
          children: [], // New item doesn't have children initially
        };

        if (!node.children) {
          node.children = [];
        }

        // Add the new item to the parent node's children
        node.children.push(newItem);

        // Update the data source
        this.dataSource.data = [...this.dataSource.data];

        // Expand the parent node to show the newly added child
        this.treeControl.expand(node);

        // Send the new item to the server (you should implement this part)
        this.treeDataService.createItem(result.name, result.quantity, result.unit, node.id).subscribe(
          (response) => {
            console.log('New item created:', response);
            this.refreshTreeData();
          },
          (error) => {
            console.error('Error creating item:', error);
          }
        );
      }
    });
  }

  deleteItemWithChildren(itemId: number): void {
    try {
      this.treeDataService.deleteItemWithChildren(itemId).subscribe(
        () => {
          // After successful deletion, refresh the data from the server
          this.treeDataService.fetchDataFromApi().subscribe(
            (data: TodoItemNode[]) => {
              // Update the data source with the new data
              this.dataSource.data = data;
            },
            (error) => {
              console.error("Error fetching data after deletion:", error);
            }
          );
        },
        (error) => {
          console.error(`Error deleting item with ID ${itemId} and its descendants:`, error);
        }
      );
    } catch (error) {
      console.error("An error occurred in the deleteItemWithChildren method:", error);
    }
  }

  openEditDialog(selectedNode: TodoItemFlatNode): void {
    const dialogRef = this.dialog.open(EditItemDialogComponent, {
      width: '300px',
      data: {
        item: selectedNode,
        parentNodes: this.getFilteredNodes(selectedNode), // Pass the filtered nodes
      },
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // Check if the parent is selected or not
        if (result.parent === null) {
          // Make the item a root node
          this._database.insertRoot(result.name);
        } else {
          // Handle the updated item data (result) here
          this.updateItemInDatabase(result);
        }
      }
    });
  }

  updateItemInDatabase(updatedItem: TodoItemNode): void {
    // Check if the updated item is moving to the root level
    if (updatedItem.parent === null) {
      // Create a new root node
      this._database.insertRoot(updatedItem.name);
    }

    // If the updated item was previously a root node, remove it from the root nodes
    if (updatedItem.parent === null && updatedItem.id) {
      const index = this._database.data.findIndex((item) => item.id === updatedItem.id);
      if (index !== -1) {
        this._database.data.splice(index, 1);
        this._database.dataChange.next(this._database.data);
      }
    }

    // Call the API service's updateItem method to send the PUT request
    this.treeDataService.updateItem(updatedItem).subscribe(
      (response) => {
        console.log('Item updated successfully:', response);
        this.refreshTreeData();
      },
      (error) => {
        console.error('Error updating item:', error);
      }
    );
  }

  getFilteredNodes(selectedNode: TodoItemNode): TodoItemNode[] {
    const allNodes = this.dataSource.data;
    const filteredNodes: TodoItemNode[] = [];

    // Function to find a node by its ID in the nested tree
    function findNodeById(nodes: TodoItemNode[], id: number): TodoItemNode | null {
      for (const node of nodes) {
        if (node.id === id) {
          return node;
        }
        if (node.children) {
          const found = findNodeById(node.children, id);
          if (found) {
            return found;
          }
        }
      }
      return null;
    }

    // Function to add a node and its descendants to the filtered nodes
    function addNodeAndDescendants(node: TodoItemNode) {
      filteredNodes.push(node);
      if (node.children) {
        for (const child of node.children) {
          // Exclude the children of the selected node
          if (child !== selectedNode && !isDescendant(selectedNode, child)) {
            addNodeAndDescendants(child);
          }
        }
      }
    }

    // Function to check if a node is a descendant of another node
    function isDescendant(parent: TodoItemNode, node: TodoItemNode): boolean {
      if (parent.children) {
        for (const child of parent.children) {
          if (child === node || isDescendant(child, node)) {
            return true;
          }
        }
      }
      return false;
    }

    // Find the selected node in the nested tree
    const foundNode = findNodeById(allNodes, selectedNode.id);

    if (foundNode) {
      // Exclude the selected node and its descendants
      for (const node of allNodes) {
        if (node !== foundNode && !isDescendant(foundNode, node)) {
          addNodeAndDescendants(node);
        }
      }
    } else {
      // If the selected node is not found, return all nodes
      return allNodes;
    }

    // Use an additional filter to exclude the selected node and its descendants
    return filteredNodes.filter(node => node !== foundNode && !isDescendant(foundNode, node));
  }

  updateItem(item: TodoItemFlatNode): void {
    // Call the function to open the edit dialog
    this.openEditDialog(item);
  }

  refreshTreeData() {
    this.treeDataService.fetchDataFromApi().subscribe((data: TodoItemNode[]) => this.dataSource.data = data);
  }
}
