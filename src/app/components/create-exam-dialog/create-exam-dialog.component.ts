import { SelectionModel } from '@angular/cdk/collections';
import { FlatTreeControl, NestedTreeControl } from '@angular/cdk/tree';
import {
  Component,
  EventEmitter,
  Inject,
  Injectable,
  OnInit,
  Output,
} from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import {
  MatTreeFlatDataSource,
  MatTreeFlattener,
  MatTreeNestedDataSource,
} from '@angular/material/tree';
import { BehaviorSubject, Subject } from 'rxjs';
import { ExamService } from 'src/app/services/exam-service/exam.service';
import { SnackbarService } from 'src/app/services/snackbar-service/snackbar.service';
import { ExamDTO } from 'src/app/shared/models/exam.model';
import { UserDTO } from 'src/app/shared/models/user.model';

/**
 * Node for question list
 */
export class QuestionNode {
  children: QuestionNode[];
  item: string;
}

/** Flat Question item node with expandable and level information */
export class QuestionFlatNode {
  item: string;
  level: number;
  expandable: boolean;
}

/**
 * The Json object for Question list data.
 */
const TREE_DATA = {
  Section1: [
    'Question 1',
    'Question 2',
    'Question 3',
  ],
  Section2: [
    'Question 1',
    'Question 2',
    'Question 3',
  ],
};

/**
 * Checklist database, it can build a tree structured Json object.
 * Each node in Json object represents a question item or a category.
 * If a node is a category, it has children items and new items can be added under the category.
 */
@Injectable()
export class ChecklistDatabase {
  dataChange = new BehaviorSubject<QuestionNode[]>([]);

  get data(): QuestionNode[] {
    return this.dataChange.value;
  }

  constructor() {
    this.initialize();
  }

  initialize(): void {
    // Build the tree nodes from Json object. The result is a list of `QuestionNode` with nested
    //     file node as children.
    const data = this.buildFileTree(TREE_DATA, 0);

    // Notify the change.
    this.dataChange.next(data);
  }

  /**
   * Build the file structure tree. The `value` is the Json object, or a sub-tree of a Json object.
   * The return value is the list of `QuestionNode`.
   */
  buildFileTree(obj: Record<string, any>, level: number): QuestionNode[] {
    return Object.keys(obj).reduce<QuestionNode[]>((accumulator, key) => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const value = obj[key];
      const node = new QuestionNode();
      node.item = key;

      if (value !== null) {
        if (typeof value === 'object') {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
          node.children = this.buildFileTree(value, level + 1);
        } else {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          node.item = value;
        }
      }

      return accumulator.concat(node);
    }, []);
  }

  /** Add an item to question list */
  insertItem(parent: QuestionNode, name: string): void {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition, @typescript-eslint/strict-boolean-expressions
    if (parent.children) {
      parent.children.push({ item: name } as QuestionNode);
      this.dataChange.next(this.data);
    }
  }

  updateItem(node: QuestionNode, name: string): void {
    node.item = name;
    this.dataChange.next(this.data);
  }

  updateQuestionsList(): void {
    this.dataChange.next(this.data);
  }
}

@Component({
  selector: 'app-create-exam-dialog',
  templateUrl: './create-exam-dialog.component.html',
  styleUrls: ['./create-exam-dialog.component.scss'],
})
export class CreateExamDialogComponent implements OnInit {
  /** Map from flat node to nested node. This helps us finding the nested node to be modified */
  flatNodeMap = new Map<QuestionFlatNode, QuestionNode>();

  /** Map from nested node to flattened node. This helps us to keep the same object for selection */
  nestedNodeMap = new Map<QuestionNode, QuestionFlatNode>();

  /** A selected parent node to be inserted */
  selectedParent: QuestionFlatNode | null = null;

  /** The new item's name */
  newItemName = '';

  treeControl: FlatTreeControl<QuestionFlatNode>;

  treeFlattener: MatTreeFlattener<QuestionNode, QuestionFlatNode>;

  dataSource: MatTreeFlatDataSource<QuestionNode, QuestionFlatNode>;

  /** The selection for checklist */
  checklistSelection = new SelectionModel<QuestionFlatNode>(
    true /* multiple */
  );

  error: Error;
  @Output() saveExam = new EventEmitter<ExamDTO>();
  examForm: FormGroup<{
    name: FormControl<string>;
    description: FormControl<string>;
    casualPrice: FormControl<number>;
    default: FormControl<boolean>;
    assignedTeacher: FormControl<string>;
    defaultExam: FormControl<boolean>;
  }>;

  questionForm: FormGroup<{
    questionName: FormControl<string>;
    writtenPrompt?: FormControl<string | null>; // a short description of the question task
    time?: FormControl<number | null>; // question time limit (seconds)
    type: FormControl<string>;
    imagePrompt?: FormControl<string | null>; // a visual prompt for the question
    audioPrompt?: FormControl<string | null>; // an audio prompt for the question
    videoPrompt?: FormControl<string | null>; // a video prompt for the question
    teacherFeedback: FormControl<boolean>; // true = teacher has to give feedback
    autoMarking: FormControl<boolean>; // false = teacher has to assign mark
    totalPoints?: FormControl<number | null>;
    randomQuestionOrder?: FormControl<boolean | null>; // for multiple choiuce question, the questions will be in random order
    length?: FormControl<number | null>; // word limit for written questions and time limit (seconds) for audio questions
    answers?: FormControl<{ question: string; correct: boolean }[] | null>; // used for multiple choice questions
  }>;

  questionTypes: { type: string; description: string; label: string }[] = [
    { type: 'written-response', description: '', label: 'Written Response' },
    { type: 'audio-response', description: '', label: 'Audio Response' },
    {
      type: 'repeat-sentence',
      description: '',
      label: 'Audio response - repeat word/sentence/paragraph',
    },
    { type: 'multiple-choice', description: '', label: 'Multiple Choice' },
    { type: 'reorder-sentence', description: '', label: 'Reorder Sentence' },
    { type: 'match-options', description: '', label: 'Match Options' },
    {
      type: 'fill-in-the-blanks',
      description: '',
      label: 'Fill in the Blanks',
    },
    { type: 'information-page', description: '', label: 'Information Page' },
  ];

  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: {
      title: string;
      exam: ExamDTO | undefined;
      teachers: UserDTO[];
    },
    private readonly dialogRef: MatDialogRef<CreateExamDialogComponent>,
    private readonly examService: ExamService,
    private readonly snackbarService: SnackbarService,
    private readonly _database: ChecklistDatabase
  ) {
    this.treeFlattener = new MatTreeFlattener(
      this.transformer,
      this.getLevel,
      this.isExpandable,
      this.getChildren
    );
    this.treeControl = new FlatTreeControl<QuestionFlatNode>(
      this.getLevel,
      this.isExpandable
    );
    this.dataSource = new MatTreeFlatDataSource(
      this.treeControl,
      this.treeFlattener
    );

    _database.dataChange.subscribe((itemData) => {
      this.dataSource.data = itemData;
    });
  }

  getLevel = (node: QuestionFlatNode): number => node.level;

  isExpandable = (node: QuestionFlatNode): boolean => node.expandable;

  getChildren = (node: QuestionNode): QuestionNode[] => node.children;

  hasChild = (_: number, _nodeData: QuestionFlatNode): boolean =>
    _nodeData.expandable;

  hasNoContent = (_: number, _nodeData: QuestionFlatNode): boolean =>
    _nodeData.item === '';

  /**
   * Transformer to convert nested node to flat node. Record the nodes in maps for later use.
   */
  transformer = (node: QuestionNode, level: number): QuestionFlatNode => {
    const existingNode = this.nestedNodeMap.get(node);
    const flatNode =
      existingNode && existingNode.item === node.item
        ? existingNode
        : new QuestionFlatNode();
    flatNode.item = node.item;
    flatNode.level = level;
    flatNode.expandable = !!node.children?.length;
    this.flatNodeMap.set(flatNode, node);
    this.nestedNodeMap.set(node, flatNode);
    return flatNode;
  };

  /** Whether all the descendants of the node are selected. */
  descendantsAllSelected(node: QuestionFlatNode): boolean {
    const descendants = this.treeControl.getDescendants(node);
    const descAllSelected =
      descendants.length > 0 &&
      descendants.every((child) => this.checklistSelection.isSelected(child));
    return descAllSelected;
  }

  /** Whether part of the descendants are selected */
  descendantsPartiallySelected(node: QuestionFlatNode): boolean {
    const descendants = this.treeControl.getDescendants(node);
    const result = descendants.some((child) =>
      this.checklistSelection.isSelected(child)
    );
    return result && !this.descendantsAllSelected(node);
  }

  /** Toggle the question item selection. Select/deselect all the descendants node */
  questionItemSelectionToggle(node: QuestionFlatNode): void {
    this.checklistSelection.toggle(node);
    const descendants = this.treeControl.getDescendants(node);
    this.checklistSelection.isSelected(node)
      ? this.checklistSelection.select(...descendants)
      : this.checklistSelection.deselect(...descendants);

    // Force update for the parent
    descendants.forEach((child) => this.checklistSelection.isSelected(child));
    this.checkAllParentsSelection(node);
  }

  /** Toggle a leaf question item selection. Check all the parents to see if they changed */
  questionLeafItemSelectionToggle(node: QuestionFlatNode): void {
    this.checklistSelection.toggle(node);
    this.checkAllParentsSelection(node);
  }

  /* Checks all the parents when a leaf node is selected/unselected */
  checkAllParentsSelection(node: QuestionFlatNode): void {
    let parent: QuestionFlatNode | null = this.getParentNode(node);
    while (parent) {
      this.checkRootNodeSelection(parent);
      parent = this.getParentNode(parent);
    }
  }

  /** Check root node checked state and change it accordingly */
  checkRootNodeSelection(node: QuestionFlatNode): void {
    const nodeSelected = this.checklistSelection.isSelected(node);
    const descendants = this.treeControl.getDescendants(node);
    const descAllSelected =
      descendants.length > 0 &&
      descendants.every((child) => this.checklistSelection.isSelected(child));
    if (nodeSelected && !descAllSelected) {
      this.checklistSelection.deselect(node);
    } else if (!nodeSelected && descAllSelected) {
      this.checklistSelection.select(node);
    }
  }

  /* Get the parent node of a node */
  getParentNode(node: QuestionFlatNode): QuestionFlatNode | null {
    const currentLevel = this.getLevel(node);

    if (currentLevel < 1) {
      return null;
    }

    const startIndex = this.treeControl.dataNodes.indexOf(node) - 1;

    for (let i = startIndex; i >= 0; i--) {
      const currentNode = this.treeControl.dataNodes[i];

      if (this.getLevel(currentNode) < currentLevel) {
        return currentNode;
      }
    }
    return null;
  }

  /** Select the category so we can insert the new item. */
  addNewItem(node: QuestionFlatNode): void {
    const parentNode = this.flatNodeMap.get(node);
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    this._database.insertItem(parentNode!, '');
    this.treeControl.expand(node);
  }

  addNewSection(): void {
    const newQuestion = {
      item: 'New Section',
      children: [],
    } as QuestionNode;
    this._database.data.push(newQuestion);
    this._database.insertItem(newQuestion, '');
    this._database.updateQuestionsList();
  }

  addNewQuestion(): void {
    const newQuestion = {
      item: 'New Question',
    } as QuestionNode;
    this._database.data.push(newQuestion);
    this._database.updateQuestionsList();
  }

  deleteItem(node: QuestionFlatNode): void {
    console.log(node);
    console.log(this._database.data);
    const indexToRemove = this._database.data.findIndex(
      (obj) => obj.item === node.item
    );
    if (indexToRemove !== -1) {
      this._database.data.splice(indexToRemove, 1);
      this._database.updateQuestionsList();
    }
  }

  /** Save the node to database */
  saveNode(node: QuestionFlatNode, itemValue: string): void {
    const nestedNode = this.flatNodeMap.get(node);
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    this._database.updateItem(nestedNode!, itemValue);
  }

  formPopulated = new Subject<boolean>();

  ngOnInit(): void {
    this.populateExamForm();
    this.populateQuestionForm();
  }

  populateExamForm(): void {
    this.examForm = new FormGroup({
      name: new FormControl(this.data.exam?.name ?? '', {
        validators: [Validators.required],
        nonNullable: true,
      }),
      description: new FormControl(this.data.exam?.description ?? '', {
        validators: [Validators.required],
        nonNullable: true,
      }),
      casualPrice: new FormControl(this.data.exam?.casualPrice ?? NaN, {
        validators: [Validators.required],
        nonNullable: true,
      }),
      default: new FormControl(this.data.exam?.default ?? false, {
        validators: [Validators.required],
        nonNullable: true,
      }),
      defaultExam: new FormControl(this.data.exam?.default ?? false, {
        validators: [Validators.required],
        nonNullable: true,
      }),
      assignedTeacher: new FormControl(this.data.exam?.assignedTeacher ?? '', {
        validators: [Validators.required],
        nonNullable: true,
      }),
    });
    this.formPopulated.next(true);
  }

  populateQuestionForm(): void {
    this.questionForm = new FormGroup({
      questionName: new FormControl('', {
        validators: [Validators.required],
        nonNullable: true,
      }),
      type: new FormControl('', {
        validators: [Validators.required],
        nonNullable: true,
      }),
      teacherFeedback: new FormControl(false, {
        validators: [Validators.required],
        nonNullable: true,
      }),
      autoMarking: new FormControl(false, {
        validators: [Validators.required],
        nonNullable: true,
      }),
    });
    this.formPopulated.next(true);
  }

  saveExamClick(): void {
    console.log(this.examForm);
    // this.saveExam.emit(this.examForm.value as ExamDTO);
    this.examService.create(this.examForm.value as ExamDTO).subscribe({
      next: () => {
        this.snackbarService.open('info', 'Exam successfully created');
        this.closeDialog(true);
      },
      error: (error: Error) => {
        this.error = error;
        this.snackbarService.openPermanent('error', error.message);
      },
    });
  }

  closeDialog(result: boolean | null): void {
    this.dialogRef.close(result);
  }
}
