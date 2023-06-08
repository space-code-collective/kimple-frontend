'use client';

import { useKeyboardShortcut } from '@/hooks/useKeyboardShortcut';
import { getCookie } from 'cookies-next';
import { useRouter } from 'next/navigation';
import { ChangeEvent, ReactElement, startTransition, useState } from 'react';

import { Note } from '@/types/note.type';

import { createNote } from '@/services/notes.service';

import { useNotifications } from '@/providers/NotificationProvider';

import Button from '@/components/Button/Button';

import styles from './Editor.module.css';

type Props = {
	note?: Note;
	update: boolean;
};

export default function Editor({ note, update }: Props): ReactElement {
	const cookieToken = getCookie('token')?.toString() ?? '';
	const [textAreaValue, setTextAreaValue] = useState(note?.content ?? '');

	const router = useRouter();
	const { addSuccess, addError, addWarning } = useNotifications();

	const handleSaveNote = async (): Promise<void> => {
		if (textAreaValue === '') {
			addWarning('Cant create empty note');
			return;
		}
		try {
			await createNote(cookieToken, { content: textAreaValue });
			startTransition(() => router.refresh());

			addSuccess('successfully created new note');
		} catch (err) {
			addError('failed to create note', err);
		}
	};

	useKeyboardShortcut(['ctrl', 's'], () => (update ? void 0 : handleSaveNote()));
	return (
		<>
			<textarea
				onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setTextAreaValue(e.target.value)}
				value={textAreaValue}
				className={styles.editor}
			/>
			<Button onClick={() => (update ? void 0 : handleSaveNote())} className={styles.button}>
				Save Note
			</Button>
		</>
	);
}
