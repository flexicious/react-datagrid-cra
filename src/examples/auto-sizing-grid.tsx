import { createColumn } from "@ezgrid/grid-core";
import { ReactDataGrid } from "@ezgrid/grid-react";
import { useState } from "react";

export const AutoSizingGrid = () => {
    const [data, setData] = useState<any[]>([
        { number: 1, value: 100 },
        { number: 2, value: 200 },
        { number: 3, value: 300 },
        { number: 4, value: 400 },
        { number: 5, value: 500 },
    ]);
    const addNewObject = () => ({ number: (data?.length || 0) + 1, value: Math.random() * 1000 });


    return <ReactDataGrid style={{ width: "500px" }} gridOptions={{
        dataProvider: data,
        enableFooters: false,
        enableFilters: false,
        toolbarOptions: {
            leftToolbarRenderer: ({ node }) => {
                return <div className="ezgrid-dg-toolbar-section">
                    <button onClick={() => {
                        const obj = addNewObject();
                        setData([...data, obj]);
                    }}>Add New</button>
                </div>;
            },
        },
        uniqueIdentifierOptions: {
            useField: "number"
        },
        enableHeightAutoAdjust: true,
        columns: [
            createColumn("number", "string", "Id Number"),
            createColumn("value", "string", "Value"),
        ]
    }}></ReactDataGrid>;
};