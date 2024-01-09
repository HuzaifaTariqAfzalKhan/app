import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TodoItemNode } from '../tree/tree.component';
import { TreeDataService } from '../tree/tree-data.service'; // Import your tree data service

@Component({
  selector: 'app-edit-item-dialog',
  templateUrl: './edit-item-dialog.component.html',
  styleUrls: ['./edit-item-dialog.component.css'],
})
export class EditItemDialogComponent implements OnInit {
  editedItem: TodoItemNode;
  parentNodes: TodoItemNode[];

  constructor(
    public dialogRef: MatDialogRef<EditItemDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public dialogData: any,
    private treeDataService: TreeDataService // Inject your tree data service
  ) {
    this.editedItem = dialogData.item;
    this.parentNodes = dialogData.parentNodes;
  }

  ngOnInit(): void {
    console.log(this.parentNodes);
  }

  saveUpdate(): void {
    if (!this.editedItem.parent) {
      // Handle making the node a root node
      // For example, you can set its parent to null
      this.editedItem.parent = null;
    }

    // Send an HTTP request to update the item
    this.treeDataService.updateItem(this.editedItem).subscribe(
      (updatedItem: any) => {
        console.log('Updated Item:', updatedItem);

        // Close the dialog and pass the updated item as the result
        this.dialogRef.close(updatedItem);
      },
      (error: any) => {
        console.error('Error updating item:', error);
      }
    );
  }

  onCancelClick(): void {
    this.dialogRef.close();
  }
}
