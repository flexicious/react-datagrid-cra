import { ApiContext, ColumnOptions, ColumnWidthMode, createColumn, createEditBehavior, createFilterBehavior, EditInfo, EditStartMode, getApi, getRowColFromNode, GridSelectionMode, itemToLabel, RendererProps } from "@ezgrid/grid-core";
import { CheckBoxEditor, DateEditor, ReactDataGrid, SelectEditor, TextInputEditor } from "@ezgrid/grid-react";
import { FC, KeyboardEvent, useEffect, useRef, useState } from "react";
import Employee from "../mockdata/Employee";
import { getScrollOffBelow } from "../utils/column-utils";

const PhoneNumberEditor: FC<RendererProps> = ({ node }) => {
    const api = getApi(node);
    const { rowIdentifier, columnIdentifier } = getRowColFromNode(node);
    const val = (api.hasChange(rowIdentifier, columnIdentifier)?.newValue
        || itemToLabel(node.rowPosition?.data, node.columnPosition?.column!));
    const areaCodeRef = useRef<HTMLInputElement>(null);
    const prefixRef = useRef<HTMLInputElement>(null);
    const suffixRef = useRef<HTMLInputElement>(null);
    useEffect(() => {
        if (areaCodeRef.current) {
            areaCodeRef.current?.focus();
        }
    }, [rowIdentifier]);
    let areaCode = "", prefix = "", suffix = "";
    if (val) {
        [areaCode, prefix, suffix] = (val?.toString() || "").split("-");
    }
    const handleChange = () => {
        const areaCode = areaCodeRef.current?.value || "";
        const prefix = prefixRef.current?.value || "";
        const suffix = suffixRef.current?.value || "";
        api.addChange(node.rowPosition!, node.columnPosition!, `${areaCode}-${prefix}-${suffix}`);
    };
    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Tab" && !e.shiftKey) {
            if (e.currentTarget !== suffixRef.current) {
                e.stopPropagation();
            }
        }
    };

    return <div className="ezgrid-dg-toolbar-section">
        <input maxLength={3} style={{ width: "25%" }} value={areaCode} ref={areaCodeRef} onChange={handleChange}
            onKeyDown={handleKeyDown} />-
        <input maxLength={3} style={{ width: "25%" }} value={prefix} ref={prefixRef} onChange={handleChange}
            onKeyDown={handleKeyDown} />-
        <input maxLength={4} style={{ width: "40%" }} value={suffix} ref={suffixRef} onChange={handleChange}
            onKeyDown={handleKeyDown} />
    </div>;
};
export const EditOptions = () => {
    const apiRef = useRef<ApiContext | null>(null);
    const [data] = useState<Record<string, any>[]>(Employee.getAllEmployees());
    const [editMode, setEditMode] = useState<boolean>(true);
    const [editStart, setEditStart] = useState<EditStartMode>(EditStartMode.DoubleClick);
    return <ReactDataGrid style={{ height: "100%", width: "100%" }} gridOptions={{
        dataProvider: data,
        uniqueIdentifierOptions: {
            useField: "employeeId"
        },
        headerRowHeight: 75,
        enableFooters: false,
        selectionMode: GridSelectionMode.MultipleCells,
        enableFilters: false,
        horizontalScroll: getScrollOffBelow(),
        behaviors: [
            createEditBehavior({}),
            createFilterBehavior({})
        ],
        toolbarOptions: {
            enableGlobalSearch: false,
            enableQuickFind: false,
            rightToolbarRenderer: ({ node }) => {
                const api = getApi(node);
                return <div className="ezgrid-dg-toolbar-section">
                    <button onClick={() => {
                        setEditMode(!editMode);
                        api.propsUpdated();
                    }}>{editMode ? "Disable Edit" : "Enable Edit"}</button>
                    <label>Start Edit Mode:</label>
                    <select value={editStart} onChange={(e) => {
                        setEditStart(e.target.value as EditStartMode);
                        api.propsUpdated();
                    }}>
                        <option value={EditStartMode.Click}>Click</option>
                        <option value={EditStartMode.DoubleClick}>Double Click</option>
                    </select>
                </div>;
            }
        },
        eventBus: {
            onApiContextReady: (ctx) => {
                apiRef.current = ctx;
            }
        }, columns: [
            {
                ...createColumn("employeeId", "string", "Id"),
                textAlign: "right",
                widthMode: ColumnWidthMode.Fixed,
                width: 75,
            },
            {
                ...createColumn("annualSalary", "currency", "Annual Salary - Text Input Editor + validator salary >50K,<100K"),
                editOptions: {
                    enableEdit: editMode,
                    editStartMode: editStart,
                    editorRenderer: TextInputEditor,
                    validateValueFunction: (value: EditInfo, columnOptions: ColumnOptions) => {
                        if (parseInt((value.newValue?.toString() || "").replace(/,/g, "")) < 50000) {
                            value.validationMessage = "Salary should be greater than 50000";
                        } else if (parseInt((value.newValue?.toString() || "").replace(/,/g, "")) > 100000) {
                            value.validationMessage = "Salary should be less than 100000";
                        } else {
                            value.validationMessage = "";
                        }
                        value.valid = value.validationMessage === "";
                        return value;
                    }
                }
            },
            {
                ...createColumn("hireDate", "date", "Hire Date - Date Editor"),
                editOptions: {
                    enableEdit: editMode,
                    editStartMode: editStart,
                    editorRenderer: DateEditor,
                }

            },
            {
                ...createColumn("department", "string", "Department - Select Dropdown editor"),
                editOptions: {
                    enableEdit: editMode,
                    editStartMode: editStart,
                    editorRenderer: SelectEditor,
                },
            },
            {
                ...createColumn("ssNo", "string", "SSN - Text Input Editor + validation Regex"),
                editOptions: {
                    enableEdit: editMode,
                    editStartMode: editStart,
                    editorRenderer: TextInputEditor,
                    validationRegex: "^\\d{3}-\\d{2}-\\d{4}$",
                    validationMessage: "SSN must be in the format ###-##-####"
                },
            },
            {
                ...createColumn("phoneNumber", "string", "Phone - Custom Editor + validator"),
                width: 150,
                editOptions: {
                    enableEdit: editMode,
                    editStartMode: editStart,
                    validateValueFunction: (value: EditInfo) => {
                        const newVal = value.newValue;
                        const regex = /^\d{3}-\d{3}-\d{4}$/;
                        if (!regex.test(newVal?.toString() || "")) {
                            value.validationMessage = "Phone number must be in the format ###-###-####";
                            value.valid = false;
                        }
                        return value;
                    },
                    editorRenderer: PhoneNumberEditor
                }

            }, {
                ...createColumn("isActive", "boolean", "Active - Checkbox Editor"),
                widthMode: ColumnWidthMode.Fixed,
                width: 75,
                editOptions: {
                    enableEdit: editMode,
                    editStartMode: editStart,
                    editorRenderer: CheckBoxEditor,
                },
            },
            {
                ...createColumn("stateCode", "string", "State - Select Dropdown editor"),
                editOptions: {
                    enableEdit: editMode,
                    editStartMode: editStart,
                    editorRenderer: SelectEditor,
                },
            },
            {
                ...createColumn("firstName", "string", "Click on cell and Start Typing"),
                headerOptions: { columnGroupText: "First/Last have Excel Edit Mode", },
                sortOptions: {
                    sortCaseInsensitive: true,
                },
                editOptions: {
                    enableEdit: editMode,
                    editStartMode: EditStartMode.Excel,
                    editorRenderer: TextInputEditor,
                },
                children: [
                    {
                        ...createColumn("lastName", "string", "Double Click for editor"),

                        sortOptions: {
                            sortCaseInsensitive: true,
                        },
                        editOptions: {
                            enableEdit: editMode,
                            editStartMode: EditStartMode.Excel,
                            editorRenderer: TextInputEditor,
                        },
                    }]
            }

        ]
    }}></ReactDataGrid>;
};