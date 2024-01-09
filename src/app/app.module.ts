import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';
import { MatTreeModule } from '@angular/material/tree'; // Import MatTreeModule
import { MatIconModule } from '@angular/material/icon'; // Import MatTreeModule
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDialogModule } from '@angular/material/dialog';
import { CdkTreeModule } from '@angular/cdk/tree'; // Import CdkTreeModule
import { AppComponent } from './app.component';
import { TreeComponent } from './tree/tree.component';
import { TreeDataService } from './tree/tree-data.service';
import { FormsModule } from '@angular/forms';
import { NewItemDialogComponent } from './new-item-dialog/new-item-dialog.component';
import { EditItemDialogComponent } from './edit-item-dialog/edit-item-dialog.component';
import { MatSelectModule } from '@angular/material/select';
import { ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';


@NgModule({
  declarations: [AppComponent, TreeComponent, NewItemDialogComponent, EditItemDialogComponent],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    MatTreeModule, // Add MatTreeModule to imports
    CdkTreeModule, // Add CdkTreeModule to imports
    MatIconModule,
    MatButtonModule,
    FormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatSelectModule,
    ReactiveFormsModule,
    MatInputModule,
    MatProgressSpinnerModule,
  ],
  providers: [TreeDataService], // Provide your data service here
  bootstrap: [AppComponent],
})
export class AppModule { }
