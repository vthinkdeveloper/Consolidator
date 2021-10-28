import { Component, OnInit, ViewChild , Input, Injectable, SimpleChanges, } from '@angular/core';
import { AdminDashboardService } from  '../assign-users/services/admin-dashboard.service';
import { AuthService } from '../services/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ToastMessageComponent } from '../toast-message/toast-message.component'
import { environment } from 'src/environments/environment';
import { of as ofObservable, Observable, BehaviorSubject, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from "rxjs/operators";
import { AppCommonFunctions } from '../services/common/app-common';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import {animate, state, style,transition, trigger } from '@angular/animations';
import { FlatTreeControl } from '@angular/cdk/tree';
import { MatTreeFlattener,MatTreeFlatDataSource } from '@angular/material/tree';
import { SelectionModel } from '@angular/cdk/collections';

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
  ParentId: string;
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
  Id: string;
  ParentId: string;
}

@Injectable()
export class AssignUserDatabase {
  dataChange: BehaviorSubject<TodoItemNode[]> = new BehaviorSubject<
  TodoItemNode[]
>([]);

get data(): TodoItemNode[] { 
  return this.dataChange.value;
}

constructor() {
  // this.initialize();
}

initialize() {
  // Build the tree nodes from Json object. The result is a list of `TodoItemNode` with nested
  //     file node as children.
  const data = this.buildFileTree(TREE_DATA, 0);

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
        value = [value]
    } 
    for (let k in value) {
    let v = value[k];
    let node = new TodoItemNode();
    node.HierarchyPath = v.HierarchyPath
    node.IsAssigned = false
    node.Name = v.Name
    node.Id = v.Id
    node.ParentId = v.ParentId
    node.HierarchyLevel = v.HierarchyLevel
    if (v && v.Children && v.Children === [] || v.Children.length === 0) {
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
}

export class UserList {
  userName: string;
  userID: number;
  fullName: string;
}

export class SearchUsersRequest {
  name: string;
  locations: string[];
  userGroups: number[];
}

@Component({
  selector: 'app-assign-users',
  templateUrl: './assign-users.component.html',
  styleUrls: ['./assign-users.component.scss'],
  animations: [
    trigger('detailExpand', [
      state(
        'void',
        style({ height: '0px', minHeight: '0', visibility: 'hidden' })
      ),
      state('*', style({ height: '*', visibility: 'visible' })),
      transition('void <=> *', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
  providers: [AssignUserDatabase]
})
export class AssignUsersComponent implements OnInit {
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

treeDataSource: MatTreeFlatDataSource<TodoItemNode, TodoItemFlatNode>;

/** The selection for checklist */
checklistSelection = new SelectionModel<TodoItemFlatNode>(
  true /* multiple */
);
  assetPath: string = environment.assetBasePath;
  userNameArray = [];
  selectedUserNameArray = [];
  userListSelectionArray = [];
  searchUsersArray = [];
  @Input() hierarchyLocation = [];
  txtQuery: string; // bind this to input with ngModel
  txtQueryChanged: Subject<string> = new Subject<string>();
  @ViewChild(MatPaginator) paginator: MatPaginator;
  dataSource: any;
  rows: any = [];
  displayedColumns: string[] = ['recent', 'name', 'email'];
  displayedColumnsMobile: string[] = ['recent', 'name'];
  selectAll = false;
  userGroupList = [];
  hierarchyList = [];
  selectedUserGroup = [];
  searchText = ''
  selectedLocations = [];
  selectedLocationsCountArray = [];
  isAdminCompleteProgram = false;
  public resourceMessage: any;
  
  constructor(
    public adminService: AdminDashboardService,
    private _authService: AuthService,
    private _snackBar: MatSnackBar,
    public database: AssignUserDatabase,
    public appCommon: AppCommonFunctions
  ) {
    this.txtQueryChanged
      .pipe(debounceTime(100), distinctUntilChanged()) // only emit if value is different from previous value
      .subscribe((model) => {
        this.txtQuery = model;

        // Call your function which calls API or do anything you would like do after a lag of 1 sec
        this.searchUsers(this.txtQuery);
      });
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
      this.treeDataSource = new MatTreeFlatDataSource(
        this.treeControl,
        this.treeFlattener
      );
      database.dataChange.subscribe((data) => {
        this.treeDataSource.data = data;
      });
  }

  ngOnInit(): void {
    let tenentId = this._authService.getUserToken().tenantId;
    this.dataSource = [];
    this.resourceMessage = this.appCommon.getResourceMessages();
    this.getProgramUsers().then(() => {
    })
    this.adminService.getUserGroups(tenentId).subscribe(
      (data) => {
        this.userGroupList = data.result;
        this.userGroupList.forEach((element) => {
          return element['selected'] = false;
        });
    },
    (err) => {
      this.userGroupList = [];
    });
      this.adminService.getHierarchy(tenentId).subscribe(
        (data) => {
          this.hierarchyList = data.result;;
    },
    (err) => {
      this.hierarchyList = [];
    })
    let completeElement = JSON.parse(localStorage.getItem('isAdminCompleteProgram'));
    if (completeElement) {
      this.isAdminCompleteProgram = true;
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.hierarchyLocation) {
      TREE_DATA = this.hierarchyLocation;
      this.database.initialize();
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

  changeNodeSelection(node: TodoItemFlatNode): void {
    node.selected = !node.selected;
    node.IsAssigned = node.selected;
    this.checklistSelection.toggle(node);
    const descendants = this.treeControl.getDescendants(node);
    descendants.forEach((element) => {
      element.selected = node.selected;
      element.IsAssigned = node.selected;
    });
    this.checklistSelection.isSelected(node)
      ? this.checklistSelection.select(...descendants)
      : this.checklistSelection.deselect(...descendants);
      this.checkSelection();
  }

  checkSelection() {
    for (let i = this.treeControl.dataNodes.length - 1; i >= 0; i--) {
      let node = this.treeControl && this.treeControl.dataNodes[i];
       const descendants = this.treeControl.getDescendants(node);
       let selected = descendants.filter((order) => order.IsAssigned);
       if((selected.length > 0) && (selected.length !== descendants.length)) {
         node.selected = false;
         node.IsAssigned = false;
         this.checklistSelection.deselect(node);
       } else if((selected.length > 0) && (selected.length === descendants.length)) {
         node.selected = true;
         node.IsAssigned = true;
         this.checklistSelection.select(node);  
       }
    }
  }

  /** Whether all the descendants of the node are selected */
  descendantsAllSelected(node: TodoItemFlatNode): boolean {
    const descendants = this.treeControl.getDescendants(node);
    let isEveryChildSelected =  descendants.every((child) =>
      this.checklistSelection.isSelected(child)
    );
    if(isEveryChildSelected) {
      node.selected = true;
      node.IsAssigned = node.selected;
      this.checklistSelection.select(node);
    } else {
      node.selected = false;
      node.IsAssigned = node.selected;
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

    /** Toggle the to-do item selection. Select/deselect all the descendants node */
    todoItemSelectionToggle(node: TodoItemFlatNode): void {
      node.selected = !node.selected;
      node.IsAssigned = node.selected;
      this.checklistSelection.toggle(node);
      const descendants = this.treeControl.getDescendants(node);
      descendants.forEach((element) => {
        element.selected = node.selected;
        element.IsAssigned = node.selected;
      });
      this.checklistSelection.isSelected(node)
        ? this.checklistSelection.select(...descendants)
        : this.checklistSelection.deselect(...descendants);
        if(!node.selected) {
          this.checkSelection();
        }
    }  

  getSelectedNodeCount(node) {
    const descendants = this.treeControl.getDescendants(node);
    let selected = descendants.filter((order) => order.IsAssigned);
    return selected
      ? selected.length === descendants.length
        ? this.resourceMessage && this.resourceMessage['alluser']
        : selected.length
      : 0;
  }

  getProgramUsers() {
    this.userNameArray = [];
    this.selectedUserNameArray =  [];
    this.userListSelectionArray = [];
    return new Promise((resolve, reject) => {
    let tenentId = this._authService.getUserToken().tenantId;
    let adminElement = JSON.parse(localStorage.getItem('adminProgramData'));
    let programId = adminElement.programID;
    this.adminService.getProgramUsers(tenentId, programId).subscribe(
      (data) => {
        this.userNameArray = data && data.result ? data.result : [];
        this.selectedUserNameArray = data && data.result ? data.result : [];
        this.userListSelectionArray = this.selectedUserNameArray.slice(0);
        resolve(true);
      },
      (err) => {
        this.userNameArray = [];
        this.selectedUserNameArray =  [];
        this.userListSelectionArray = [];
        this.openSnackBar('', err.error, 'error');
        resolve(true);
      }
    );
    })
  }

  changeSelectAll(event) {
    if (this.selectAll) {
      this.searchUsersArray.forEach((data) => {
        data.selected = true;
      });
      this.userListSelectionArray = [];
      this.userListSelectionArray = this.searchUsersArray;
    } else {
      this.searchUsersArray.forEach((data) => {
        data.selected = false;
      });
      this.userListSelectionArray = [];
    }
  }

  isSelectAll() {
    var res = this.searchUsersArray.filter(item1 => 
      this.userListSelectionArray.some(item2 => (item2.fullName === item1.fullName && item2.userID === item1.userID && item2.userName === item1.userName)))

    if(this.searchUsersArray.length === res.length) {
      this.selectAll = true;
      return true
    }  
    this.selectAll = false;
    return false;
  }

  selectItem(event, element) {
     if(event) {
      this.userListSelectionArray.push(element);
     } else {
      this.userListSelectionArray = this.userListSelectionArray.filter((item) => {
        return !(item.userName === element.userName && item.userID === element.userID && item.fullName === element.fullName);
      })
     }
    //  if(this.userListSelectionArray.length == 0) {
    //   this.userListSelectionArray = this.userNameArray;
    // }
  }

  selectFilterGroup(event) {
    event.selected = !event.selected;
  }

  getLocationFilterValues() {
    let selectedValue = this.treeControl.dataNodes.filter(
      (order) => order.IsAssigned
    );
    for (let i = this.treeControl.dataNodes.length - 1; i >= 0; i--) {
      let node = this.treeControl && this.treeControl.dataNodes[i];
       const descendants = this.treeControl.getDescendants(node);
       let selected = descendants.filter((order) => order.IsAssigned);
       if((selected.length > 0) && (selected.length !== descendants.length)) {
        let selectedValueData = selectedValue.filter(
          (order) => order.Id === node.Id
        );
        if(!selectedValueData.length) {
          selectedValue.push(node);
        }
       } 
    }
  
    var highest = Number.NEGATIVE_INFINITY;
    var tmp;
    for (var i = selectedValue.length - 1; i >= 0; i--) {
      tmp = selectedValue[i].HierarchyLevel;
      if (tmp > highest) {
        highest = tmp;
      }
    }
    this.selectedLocationsCountArray = [];
    this.selectedLocationsCountArray = this.getLocationsValues(this.hierarchyLocation,highest, selectedValue);
   
    return this.selectedLocationsCountArray
  }

  getLocationsValues(hierarchyLocation, selectedHierarchyLevel, selectedValue) {
    let value;
    if (!(hierarchyLocation instanceof Array)) {
      value = [hierarchyLocation];
    } else {
      value = hierarchyLocation
    }
    for(let i=0;i< value.length;i++) {
      let locationValue = value[i];
      if(((locationValue.HierarchyLevel === selectedHierarchyLevel) || (locationValue.Children && locationValue.Children.length === 0)) && this.isLocationItemSelected(locationValue, selectedValue, selectedHierarchyLevel)) {
        this.selectedLocationsCountArray.push(locationValue.Name);
      } else {
        if (locationValue && locationValue.Children && locationValue.Children.length) {
          this.getLocationsValues(locationValue.Children,selectedHierarchyLevel,selectedValue);
        }
      }
    }
    return this.selectedLocationsCountArray;
  }

  isLocationItemSelected(locationValue, selectedValue, selectedHierarchyLevel) {
    let selectedValueArray = selectedValue.filter((order) =>
     order.Id == locationValue.Id)
    if(selectedValueArray && selectedValueArray.length) {
      return true
    } else {
      return false;
    }
  }


  getLocationCount() {
    let value = this.getLocationFilterValues();
    return value.length;
  }  

  getLocationExists() {
    let value = this.getLocationFilterValues();
    if (value.length) {
      return true;
    } else {
      return false;
    }
  }

  getFirstLocation() {
    let value = this.getLocationFilterValues();
    return value[value.length - 1];
  }

  getFilterGroupValues() {
    let selectedUserGroupArray = this.userGroupList.filter((user) => user.selected)
    if (selectedUserGroupArray.length) {
      return true;
    } else {
      return false;
    }
  }

  getFilterLocationCount() {
    let value = this.getLocationFilterValues();
    return value.length;
  }

  getFilterListCount() {
    let selectedUserGroupArray = this.userGroupList.filter((user) => user.selected)
    return selectedUserGroupArray.length;
  }

  getFirstName() {
    let selectedUserGroupArray = this.userGroupList.filter((user) => user.selected)
    return selectedUserGroupArray[0].groupName;
  }

  onFieldChange(text) {
    let queryText =
      text && text.target && text.target.value ? text.target.value : '';
    this.txtQueryChanged.next(queryText);
  }

  searchUsers(text) {
    let selectedValue = this.treeControl.dataNodes.filter(
      (order) => order.IsAssigned
    );
    for (let i = this.treeControl.dataNodes.length - 1; i >= 0; i--) {
      let node = this.treeControl && this.treeControl.dataNodes[i];
       const descendants = this.treeControl.getDescendants(node);
       let selected = descendants.filter((order) => order.IsAssigned);
       if((selected.length > 0) && (selected.length !== descendants.length)) {
        let selectedValueData = selectedValue.filter(
          (order) => order.Id === node.Id
        );
        if(!selectedValueData.length) {
          selectedValue.push(node);
        }
       } 
    }
  
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
    let selectedUserGroupArray = this.userGroupList.filter((user) => user.selected)
    let userGroupListArray = []
    selectedUserGroupArray.forEach((user) => {
      userGroupListArray.push(user.groupID);
    });

    let userSearchRequest : SearchUsersRequest =  new SearchUsersRequest()
    userSearchRequest.name = text;
    userSearchRequest.locations = this.selectedLocations;
    userSearchRequest.userGroups = userGroupListArray;
    this.appCommon.showLoader('loadingSpinnerContainerOrder');
    let tenentId = this._authService.getUserToken().tenantId;
    this.adminService.searchUsers(tenentId, userSearchRequest).subscribe(
      (data) => {
        this.appCommon.hideLoader('loadingSpinnerContainerOrder');
        this.searchUsersArray = data.result;
        this.searchUsersArray.forEach((data) => {
        var result = this.userListSelectionArray.filter(function (item) {
            return (item.fullName == data.fullName && item.userID == data.userID && item.userName && data.userName);
        });
        if(result.length){
            data['selected'] = true;
        } else {
            data['selected'] = false;
            }
        });
        this.dataSource = new MatTableDataSource<UserList>(
          this.searchUsersArray
        );
        this.dataSource.paginator = this.paginator;
        },
        (err) => {
          this.appCommon.hideLoader('loadingSpinnerContainerOrder');
          this.searchUsersArray = [];
          this.openSnackBar('', err.error, 'error');
        }
    );
  }

  isItemsSelected() {
    let selectedItems = this.searchUsersArray.filter((item) => {
      return item.selected === true;
    });
    if (selectedItems && selectedItems.length > 0) {
      return true;
    } else {
      return false;
    }
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

  isToolTipExists(item,index) {
    let elemntId = item && item.fullName + index
    let element = document.getElementById(elemntId);
    if(element && (element.scrollWidth > element.offsetWidth)) {
      return item.fullName;
    }
    return ''
  }

  saveAssignUsers() {
    if(this.isItemsSelected()) {
    let selectedUsers:any = this.userListSelectionArray;
    let selectedUsersArrayValue = selectedUsers.map((element) => {
       return { userName: element.userName, userID: element.userID, fullName: element.fullName};
    })
    this.appCommon.showLoader('loadingSpinnerContainerOrder');
    let tenentId = this._authService.getUserToken().tenantId;
    let adminElement = JSON.parse(localStorage.getItem('adminProgramData'));
    let programId = adminElement.programID;
    this.adminService.addUsers(tenentId,programId,selectedUsersArrayValue).subscribe(
      (data) => {
         this.getProgramUsers().then(() => {
          this.searchUsers(this.searchText)
          this.openSnackBar('', this.resourceMessage && this.resourceMessage['usersuccess'], 'success');
          // this.appCommon.hideLoader('loadingSpinnerContainerOrder'); 
        })
      },
      (err) => {
        this.appCommon.hideLoader('loadingSpinnerContainerOrder');
        this.openSnackBar('', err.error, 'error');
      })
    } else {
      this.openSnackBar('',this.resourceMessage && this.resourceMessage['uservalidation'],'error')
    }
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
       && this.isItemSelected(locationValue, selectedValue,selectedHierarchyLevel)) {
        this.selectedLocations.push(locationValue.Id);
      } else {
        if (locationValue && locationValue.Children && locationValue.Children.length) {
          this.getLocations(locationValue.Children,selectedHierarchyLevel,selectedValue);
        }
      }
    }
    return this.selectedLocations;
  }

  isItemSelected(locationValue, selectedValue,selectedHierarchyLevel) {
    let selectedValueArray = selectedValue.filter((order) =>
     order.Id == locationValue.Id)
    if(selectedValueArray && selectedValueArray.length) {
      return true
    } else {
      return false;
    }
  }
}
