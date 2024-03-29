'use client';

import { useKeyboardShortcut } from '@/hooks/useKeyboardShortcut';
import { getCookie } from 'cookies-next';
import { useRouter } from 'next/navigation';
import { ReactElement, startTransition, useState } from 'react';

import { Note } from '@/types/note.type';

import { createNote, updateNote } from '@/services/notes.service';

import { useNotifications } from '@/providers/NotificationProvider';

import Button from '@/components/Button/Button';
import Input from '@/components/Input/Input';

import styles from './Editor.module.css';

type Props = {
	note?: Note;
};

export default function Editor({ note }: Props): ReactElement {
	const cookieToken = getCookie('token')?.toString() ?? '';
	const [noteContent, setNoteContent] = useState(note?.content ?? '');
	const [noteTitle, setNoteTitle] = useState(note?.title ?? '');

	const router = useRouter();
	const { addSuccess, addError, addWarning } = useNotifications();

	const handleSaveNote = async (): Promise<void> => {
		if (note) {
			try {
				await updateNote(cookieToken, note.id, {
					content: noteContent,
					title: noteTitle,
				});

				startTransition(() => router.refresh());

				addSuccess('successfully updated note');
			} catch (err) {
				addError('failed to update note', err);
			}
		} else {
			if (noteContent === '') {
				addWarning(`can't create empty note`);
				return;
			}
			try {
				const createdNote = await createNote(cookieToken, {
					content: noteContent,
					title: noteTitle,
				});

				startTransition(() => {
					router.refresh();
					router.push(`/editor/${createdNote.id}`);
				});

				addSuccess('successfully created new note');
			} catch (err) {
				addError('failed to create new note', err);
			}
		}
	};

	useKeyboardShortcut(['ctrl', 's'], () => handleSaveNote());
	return (
		<div className={styles.container}>
			<Input
				value={noteTitle}
				placeholder="Your note title..."
				onChange={(e) => setNoteTitle(e.target.value)}
				className={styles.titleInput}
			/>
			<textarea onChange={(e) => setNoteContent(e.target.value)} value={noteContent} className={styles.editor} />
			<Button onClick={() => handleSaveNote()} className={styles.saveButton}>
				Save Note
			</Button>
		</div>
	);
}
