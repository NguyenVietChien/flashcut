'use client'

import type { ForwardedRef } from 'react'
import {
    MDXEditor,
    type MDXEditorMethods,
    type MDXEditorProps,
    headingsPlugin,
    listsPlugin,
    quotePlugin,
    thematicBreakPlugin,
    markdownShortcutPlugin,
    linkPlugin,
    linkDialogPlugin,
    imagePlugin,
    tablePlugin,
    toolbarPlugin,
    codeBlockPlugin,
    codeMirrorPlugin,
    diffSourcePlugin,
    BoldItalicUnderlineToggles,
    BlockTypeSelect,
    CreateLink,
    InsertImage,
    InsertTable,
    InsertThematicBreak,
    ListsToggle,
    UndoRedo,
    DiffSourceToggleWrapper,
    CodeToggle,
    InsertCodeBlock,
    Separator,
} from '@mdxeditor/editor'
import '@mdxeditor/editor/style.css'

interface InitializedMDXEditorProps extends MDXEditorProps {
    editorRef: ForwardedRef<MDXEditorMethods> | null
    imageUploadHandler?: (image: File) => Promise<string>
}

export default function InitializedMDXEditor({
    editorRef,
    imageUploadHandler,
    ...props
}: InitializedMDXEditorProps) {
    return (
        <MDXEditor
            plugins={[
                headingsPlugin(),
                listsPlugin(),
                quotePlugin(),
                thematicBreakPlugin(),
                markdownShortcutPlugin(),
                linkPlugin(),
                linkDialogPlugin(),
                tablePlugin(),
                codeBlockPlugin({ defaultCodeBlockLanguage: '' }),
                codeMirrorPlugin({
                    codeBlockLanguages: {
                        js: 'JavaScript',
                        ts: 'TypeScript',
                        tsx: 'TSX',
                        jsx: 'JSX',
                        css: 'CSS',
                        html: 'HTML',
                        python: 'Python',
                        bash: 'Bash',
                        json: 'JSON',
                        '': 'Plain Text',
                    },
                }),
                imagePlugin({
                    imageUploadHandler: imageUploadHandler || (async () => ''),
                }),
                diffSourcePlugin({ viewMode: 'rich-text' }),
                toolbarPlugin({
                    toolbarContents: () => (
                        <DiffSourceToggleWrapper>
                            <UndoRedo />
                            <Separator />
                            <BoldItalicUnderlineToggles />
                            <CodeToggle />
                            <Separator />
                            <BlockTypeSelect />
                            <Separator />
                            <ListsToggle />
                            <Separator />
                            <CreateLink />
                            <InsertImage />
                            <InsertTable />
                            <InsertThematicBreak />
                            <Separator />
                            <InsertCodeBlock />
                        </DiffSourceToggleWrapper>
                    ),
                }),
            ]}
            {...props}
            ref={editorRef}
        />
    )
}
