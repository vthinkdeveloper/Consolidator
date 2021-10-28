import { Component, OnInit, Injectable } from '@angular/core';
import { AdminDashboardService } from  '../assign-users/services/admin-dashboard.service';
import { AuthService } from '../services/auth.service';
import { TreeSelectionService } from '../../app/tree-selection.service';
import { FlatTreeControl } from '@angular/cdk/tree';
import { MatTreeFlattener,MatTreeFlatDataSource } from '@angular/material/tree';
import { of as ofObservable, Observable, BehaviorSubject, Subject } from 'rxjs';
import { AppCommonFunctions } from '../services/common/app-common';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ToastMessageComponent } from '../toast-message/toast-message.component';
import { environment } from 'src/environments/environment';
/**
 * Node for to-do item
 */
export class TodoItemNode {
  Children: TodoItemNode[];
  IsAssigned: boolean;
  HierarchyLevel: number;
  Name: string
  Id: string;
  HierarchyPath: string;
  ParentId: number;
}

let TREE_DATA = [];

/** Flat to-do item node with expandable and level information */
export class TodoItemFlatNode {
  Name: string;
  level: number;
  expandable: boolean;
  selected: boolean;
  IsAssigned: boolean;
  HierarchyLevel: number;
  ParentId: number;
  Id: string;
}

@Injectable()
export class ChecklistDatabase {
  dataChange: BehaviorSubject<TodoItemNode[]> = new BehaviorSubject<
    TodoItemNode[]
  >([]);
  treeData: any[];
  matchedLevel = [];
  parentIds = [];
  get data(): TodoItemNode[] {
    return this.dataChange.value;
  }

  constructor() {
    // this.initialize();
  }

  initialize() {
    // Build the tree nodes from Json object. The result is a list of `TodoItemNode` with nested
    //     file node as children.
    this.treeData = TREE_DATA;
    const data = this.buildFileTree(TREE_DATA, 0); //To build tree data
    // Notify the change.
    this.dataChange.next(data);
  }

  initializeSearch(data) {
    // Notify the change.
   this.dataChange.next(data);
  }

  /**
   * Build the file structure tree. The `value` is the Json object, or a sub-tree of a Json object.
   * The return value is the list of `TodoItemNode`.
   */
  buildFileTree(value: any, level: number) {
    let data: any[] = [];
    if (!(value instanceof Array)) {
      value = [value];
    }
    for (let k in value) {
      let v = value[k];
      let node = new TodoItemNode();
      node.HierarchyPath = v.HierarchyPath;
      node.IsAssigned = v.IsAssigned;
      node.Name = v.Name;
      node.Id = v.Id;
      node.ParentId = v.ParentId;
      node.HierarchyLevel = v.HierarchyLevel;
      if ((v && v.Children && v.Children === []) || v.Children.length === 0) {
        node.Children = [];
      } else if (v && v.Children && v.Children.length > 0) {
        node.Children = this.buildFileTree(v.Children, level + 1);
      } else {
        node.Children = [];
      }
      data.push(node);
    }
    return data;
  }

  public filter(filterText: string) {
    this.initialize();
    this.matchedLevel = [];
    let filteredTreeData;
    if (filterText) {
      filteredTreeData = TREE_DATA;
      const data = this.buildFileTreeFilter(filteredTreeData, 0, filterText);
      return this.matchedLevel; //Matched Nodes
    } else {
      filteredTreeData = TREE_DATA;
      const data = this.buildFileTree(filteredTreeData, 0);
      return [];
    }
  }

  setSearchData(value, level, filteredTreeData) {
    let data: any[] = [];
    if (!(value instanceof Array)) {
      value = [value];
    }
    for (let k in value) {
      let v = value[k];
      let node = new TodoItemNode();
      node.HierarchyPath = v.HierarchyPath;
      node.IsAssigned = v.IsAssigned;
      node.Name = v.Name;
      node.Id = v.Id;
      node.ParentId = v.ParentId;
      node.HierarchyLevel = v.HierarchyLevel;
      if ((v && v.Children && v.Children === []) || v.Children.length === 0) {
        node.Children = [];
      } else if (v && v.Children && v.Children.length > 0) {
        node.Children = this.setSearchData(
          v.Children,
          level + 1,
          filteredTreeData
        );
      } else {
        node.Children = [];
      }
      let filteredValue = filteredTreeData.filter((order) => order.Id === node.Id); 
      if(filteredValue.length) {
        data.push(node);
      }
    }
    return data;
  }

  buildFileTreeFilter(value, level, keyValue) {
    let data: any[] = [];
    if (!(value instanceof Array)) {
      value = [value];
    }
    for (let k in value) {
      let v = value[k];
      let node = new TodoItemNode();
      node.HierarchyPath = v.HierarchyPath;
      node.IsAssigned = v.IsAssigned;
      node.Name = v.Name;
      this.parentIds.push(v.Id);
      if (node.Name.toLowerCase().includes(keyValue.toLowerCase())) {
        let value = {
          id: v.Id,
          level: level,
          name: v.Name,
        };
        this.matchedLevel.push(value);
        break;
      }
      node.Id = v.Id;
      node.ParentId = v.ParentId;
      node.HierarchyLevel = v.HierarchyLevel;
      if ((v && v.Children && v.Children === []) || v.Children.length === 0) {
        node.Children = [];
      } else if (v && v.Children && v.Children.length > 0) {
        node.Children = this.buildFileTreeFilter(
          v.Children,
          level + 1,
          keyValue
        );
      } else {
        node.Children = [];
      }
      data.push(node);
    }
    return data;
  }
}

@Component({
  selector: 'app-assign-location',
  templateUrl: './assign-location.component.html',
  styleUrls: ['./assign-location.component.scss'],
  providers: [ChecklistDatabase],
})
export class AssignLocationComponent implements OnInit {
  flatNodeMap: Map<TodoItemFlatNode, TodoItemNode> = new Map<
    TodoItemFlatNode,
    TodoItemNode
  >();

  nestedNodeMap: Map<TodoItemNode, TodoItemFlatNode> = new Map<
    TodoItemNode,
    TodoItemFlatNode
  >();

  treeControl: FlatTreeControl<TodoItemFlatNode>;

  treeFlattener: MatTreeFlattener<TodoItemNode, TodoItemFlatNode>;

  dataSource: MatTreeFlatDataSource<TodoItemNode, TodoItemFlatNode>;

  // txtQueryChanged: Subject<string> = new Subject<string>();

  /** The selection for checklist */
  checklistSelection = new TreeSelectionService<TodoItemFlatNode>();
  txtQuery: string; // bind this to input with ngModel
  assetPath: string = environment.assetBasePath;
  hierarchyLocation = [];
  selectedLocations = [];
  public resourceMessage: any;
  adminData: any;
  searchText: string = '';
  paddingIndent = '20';
  isAdminCompleteProgram = false;
  isSearchValueData = false;
  matchedTreeNodeValues = []

  constructor(
    public adminService: AdminDashboardService,
    private _authService: AuthService,
    public database: ChecklistDatabase,
    public appCommon: AppCommonFunctions,
    private _snackBar: MatSnackBar
  ) {
    this.treeFlattener = new MatTreeFlattener(
      this.transformer,
      this.getLevel,
      this.isExpandable,
      this.getChildren
    );
    this.treeControl = new FlatTreeControl<TodoItemFlatNode>(
      this.getLevel,
      this.isExpandable
    );
    this.dataSource = new MatTreeFlatDataSource(
      this.treeControl,
      this.treeFlattener
    );
    database.dataChange.subscribe((data) => {
      this.dataSource.data = data;
    });
  }

  ngOnInit(): void {
    this.resourceMessage = this.appCommon.getResourceMessages();
    let completeElement = JSON.parse(localStorage.getItem('isAdminCompleteProgram'));
    if (completeElement) {
      this.isAdminCompleteProgram = true;
    }
    this.adminData = JSON.parse(localStorage.getItem('adminProgramData'));
    this.initiaLizeData();
    if(this.appCommon.isMobileCompatibleScreen()) {
        this.paddingIndent = '10';
    } else {
        this.paddingIndent = '20';
    }
  }

  initiaLizeData() {
    this.checklistSelection = new TreeSelectionService<TodoItemFlatNode>();
    this.hierarchyLocation = [];
    TREE_DATA = []
    let tenentId = this._authService.getUserToken().tenantId;
    this.appCommon.showLoader('loadingSpinnerContainerprogram');
    let hierarchyLevel = JSON.parse(
      sessionStorage.getItem('ConsolidatorConfig')
    )['hierarchyLevel'];
    this.adminService
      .getHierarchyForProgram(tenentId, this.adminData.programID, hierarchyLevel)
      .subscribe(
        (data) => {
          this.hierarchyLocation = data.result;
          this.appCommon.hideLoader('loadingSpinnerContainerprogram');
          TREE_DATA = this.hierarchyLocation;
          this.database.initialize();
          this.setCheckListSelection();
          this.checkAllItemsSelected();
        },
        (err) => {
          this.hierarchyLocation = [];
          this.appCommon.hideLoader('loadingSpinnerContainerOrder');
        }
      );
  }
  checkAllItemsSelected() {
    if (
      this.treeControl &&
      this.treeControl.dataNodes &&
      this.treeControl.dataNodes.length
    ) {
      for (let i = this.treeControl.dataNodes.length - 1; i >= 0; i--) {
        let node = this.treeControl && this.treeControl.dataNodes[i];
        const descendants = this.treeControl.getDescendants(node);
        let isEveryChildSelected = descendants.every((child) =>
          this.checklistSelection.isSelected(child)
        );
        if(descendants && descendants.length > 0) {
          if (isEveryChildSelected) {
            this.checklistSelection.select(node);
          } else {
            this.checklistSelection.deselect(node);
          }
        }
      }
    }
  }

  setCheckListSelection(){
    if (
      this.treeControl &&
      this.treeControl.dataNodes &&
      this.treeControl.dataNodes.length
    ) {
      for (let i = 0; i < this.treeControl.dataNodes.length; i++) {
        let node = this.treeControl && this.treeControl.dataNodes[i];
        if (node.IsAssigned) {
         this.checklistSelection.toggle(node)
        }
      }
  }
}

  getLevel = (node: TodoItemFlatNode) => {
    return node.level;
  };

  isExpandable = (node: TodoItemFlatNode) => {
    return node.expandable;
  };

  getChildren = (node: TodoItemNode): Observable<TodoItemNode[]> => {
    return ofObservable(node.Children);
  };

  hasNoContent = (
    _: number,
    _nodeData: TodoItemFlatNode,
    node: TodoItemNode
  ) => {
    return node.Children.length === 0 || node.Children === [];
  };

  hasChild = (_: number, _nodeData: TodoItemFlatNode) => _nodeData.expandable;

  transformer = (node: TodoItemNode, level: number) => {
    let flatNode =
      this.nestedNodeMap.has(node) &&
      this.nestedNodeMap.get(node)!.Name === node.Name
        ? this.nestedNodeMap.get(node)!
        : new TodoItemFlatNode();
    flatNode.Name = node.Name;
    flatNode.level = level;
    flatNode.expandable = node.Children.length > 0;
    flatNode.selected = node.IsAssigned;
    flatNode.IsAssigned = node.IsAssigned;
    flatNode.HierarchyLevel = node.HierarchyLevel;
    flatNode.Id = node.Id;
    flatNode.ParentId = node.ParentId;
    this.flatNodeMap.set(flatNode, node);
    this.nestedNodeMap.set(node, flatNode);
    return flatNode;
  };

  checkSelected(node){
   return this.checklistSelection.isSelected(node);
  }

  getAssignLocations() {
    let selectedValue = this.treeControl.dataNodes.filter(
      (order) => order.IsAssigned
    );
    var highest = Number.NEGATIVE_INFINITY;
    var tmp;
    for (var i = selectedValue.length - 1; i >= 0; i--) {
      tmp = selectedValue[i].HierarchyLevel;
      if (tmp > highest) {
        highest = tmp;
      }
    }
    selectedValue = selectedValue.filter((order) => order.HierarchyLevel === highest)
    return selectedValue
  }

  searchLocations(text){
   let newArray = [];
   let value =  this.database.filter(text);
   if (value.length){
     //To get Matched Values or filtered Values
     for (let k in value) {
      this.matchedTreeNodeValues = this.treeControl.dataNodes;
      let element = value[k];
      this.deleteDataSource(element.id,element.level);
      for(let i in this.matchedTreeNodeValues) {
        let elementValue = this.matchedTreeNodeValues[i];
        var x = newArray.findIndex(function(item) {
          return ((element.Name === item.Name) && (element.Id === item.Id) && (element.level === item.level) &&
          (element.ParentId === item.ParentId) && (element.HierarchyLevel === item.HierarchyLevel));
        });
        if (x === -1) {
          newArray.push(elementValue);
        }
      }
     }
    let searchData = this.database.setSearchData(TREE_DATA, 0, newArray);  //To filter search data
    this.database.initializeSearch(searchData);
    this.treeControl.expandAll(); //To expand all nodes while search
   } else {
    // this.setAssignedValuesSelectedSearch();
   }
  }

  deleteDataSource(id,level) {
    let levelValue = level;
    let idValue = id;
    if(levelValue != 0) {
          this.matchedTreeNodeValues = this.matchedTreeNodeValues.filter(user => (user.Id === id && user.level === level) ||  (user.level !== level));
          let valueLength = this.matchedTreeNodeValues.filter(levelValue => levelValue.level === level)
          if (valueLength.length <= 1) {
            levelValue = level - 1
            idValue = valueLength[0].ParentId
          }
    }      
    if (levelValue != 0) {
        this.deleteDataSource(idValue,levelValue)
    }                                                                                                                                                                                                                      
  }

  /** Change Node selection - select and deselect node and its descendants*/
  changeNodeSelection(node: TodoItemFlatNode): void {
    if(this.checklistSelection.isSelected(node)) {
      this.checklistSelection.deselect(node)
    } else {
      this.checklistSelection.select(node);
    }
    const descendants = this.treeControl.getDescendants(node);
    this.checklistSelection.isSelected(node)
      ? this.checklistSelection.select(...descendants)
      : this.checklistSelection.deselect(...descendants);
  }

  /** Whether all the descendants of the node are selected */
  descendantsAllSelected(node: TodoItemFlatNode): boolean {
    const descendants = this.treeControl.getDescendants(node);
    let isEveryChildSelected = descendants.every((child) =>
      this.checklistSelection.isSelected(child)
    );
    if(isEveryChildSelected) {
      this.checklistSelection.select(node);
    } else {
      this.checklistSelection.deselect(node);
    }
   return isEveryChildSelected;
  }

  /** Whether part of the descendants are selected */
  descendantsPartiallySelected(node: TodoItemFlatNode): boolean {
    const descendants = this.treeControl.getDescendants(node);
    const result = descendants.some((child) =>
      this.checklistSelection.isSelected(child)
    );
    return result && !this.descendantsAllSelected(node);
  }

  getSelectedNodeCount(node) {
    const descendantsValue = this.treeControl.getDescendants(node);
    let isEveryChildSelected = descendantsValue.every((child) =>
      this.checklistSelection.isSelected(child)
    );
    if (isEveryChildSelected) {
      return this.resourceMessage && this.resourceMessage['alluser']
    }
    const descendants = this.treeControl.getDescendants(node);
    let selectedValue = descendants.filter((item) =>
    this.isValueExistsInSelection(item.Id));

    var highest = Number.NEGATIVE_INFINITY;
    var tmp;
    for (var i = selectedValue.length - 1; i >= 0; i--) {
      tmp = selectedValue[i].HierarchyLevel;
      if (tmp > highest) {
        highest = tmp;
      }
    }
    let isValueExists = descendants.filter((item) => item.HierarchyLevel === highest && this.isValueExistsInSelection(item.Id));
    return isValueExists.length;
  }

  isValueExistsInSelection(itemId) {
    let arrayValue = this.checklistSelection.selected;
    let value = arrayValue.filter(item=> item.Id === itemId)
    if(value && value.length) {
      return true 
    } else {
      return false
    }
  }

  /** Toggle the to-do item selection. Select/deselect all the descendants node */
  changeSelectAll(event) {
    let node = this.treeControl && this.treeControl.dataNodes[0];
    const descendants = this.treeControl.getDescendants(node);
    this.checklistSelection.isSelected(node)
      ? this.checklistSelection.deselect(...descendants)
      : this.checklistSelection.select(...descendants);
  }

  checkSelectAll() {
    if(this.treeControl && this.treeControl.dataNodes && this.treeControl.dataNodes.length) {
      let node = this.treeControl && this.treeControl.dataNodes[0];
      const descendants = this.treeControl.getDescendants(node);
      let isEveryChildSelected = descendants.every((child) =>
        this.checklistSelection.isSelected(child)
      );
      return isEveryChildSelected
    }
    return false;
  }

  /** Toggle the to-do item selection. Select/deselect all the descendants node */
  todoItemSelectionToggle(node: TodoItemFlatNode): void {
    this.checklistSelection.toggle(node);
    const descendants = this.treeControl.getDescendants(node);
    this.checklistSelection.isSelected(node)
      ? this.checklistSelection.select(...descendants)
      : this.checklistSelection.deselect(...descendants);
  }

  saveAssignLocations() {
    if(this.searchText && this.searchText != '') {
      this.searchText = ''
      this.searchLocations(this.searchText);
    }
    let selectedValue = this.checklistSelection.selected;
    var highest = Number.NEGATIVE_INFINITY;
    var tmp;
    for (var i = selectedValue.length - 1; i >= 0; i--) {
      tmp = selectedValue[i].HierarchyLevel;
      if (tmp > highest) {
        highest = tmp;
      }
    }
    this.selectedLocations = [];
    this.selectedLocations = this.getLocations(this.hierarchyLocation,highest, selectedValue);
    this.appCommon.showLoader('loadingSpinnerContainerprogram');
    let tenentId = this._authService.getUserToken().tenantId;
   this.adminService.addProgramLocations(tenentId, this.adminData.programID, this.selectedLocations).subscribe(
    (data) => {
 
      this.appCommon.hideLoader('loadingSpinnerContainerprogram');
      this.initiaLizeData();
      this.openSnackBar('',this.resourceMessage && this.resourceMessage['locationsuccess'],'success')
    },
    (err) => {
      this.appCommon.hideLoader('loadingSpinnerContainerprogram');
      this.openSnackBar('',err.error,'error')
    });
  }

  openSnackBar(name, message, type) {
    this._snackBar.openFromComponent(ToastMessageComponent, {
      duration: 5000,
      horizontalPosition: 'right',
      verticalPosition: 'top',
      panelClass: [type],
      data: {
        html: message,
        type: type,
        assetpath: this.assetPath,
        name: name,
      },
    });
  }

  getLocations(hierarchyLocation, selectedHierarchyLevel, selectedValue) {
    let value;
    if (!(hierarchyLocation instanceof Array)) {
      value = [hierarchyLocation];
    } else {
      value = hierarchyLocation
    }
    for(let i=0;i< value.length;i++) {
      let locationValue = value[i];
      if(((locationValue.HierarchyLevel === selectedHierarchyLevel) || (locationValue.Children && locationValue.Children.length === 0)) 
      && this.isItemSelected(locationValue, selectedValue)) {
        let value = {
            id: locationValue.Id
        }
        this.selectedLocations.push(value);
      } else {
        if (locationValue && locationValue.Children && locationValue.Children.length) {
          this.getLocations(locationValue.Children,selectedHierarchyLevel,selectedValue);
        }
      }
    }
    return this.selectedLocations;
  }

  isItemSelected(locationValue, selectedValue) {
    let selectedValueArray = selectedValue.filter((order) =>
     order.Id == locationValue.Id)
    if(selectedValueArray && selectedValueArray.length) {
      return true
    } else {
      return false;
    }
  }

  onFieldChange(text) {
    let queryText =
      text && text.target && text.target.value ? text.target.value : text ? text : '';
    this.searchLocations(queryText);
  }

}
