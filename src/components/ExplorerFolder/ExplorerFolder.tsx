'use client';

import clsx from 'clsx';
import { getCookie } from 'cookies-next';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ReactElement, startTransition, useEffect, useState } from 'react';

import { Folder } from '@/types/folder.type';
import { Note } from '@/types/note.type';
import { Todo } from '@/types/todo.type';

import { deleteFolder, updateFolder } from '@/services/folder.service';

import { useExplorer } from '@/providers/ExplorerProvider';
import { useNotifications } from '@/providers/NotificationProvider';

import ExplorerAddInput from '@/components/ExplorerAddInput/ExplorerAddInput';
import ExplorerNote from '@/components/ExplorerNote/ExplorerNote';
import ExplorerTodo from '@/components/ExplorerTodo/ExplorerTodo';
import Tooltip from '@/components/Tooltip/Tooltip';

import chevronIcon from '@/assets/chevron-right.svg';
import folderIcon from '@/assets/folder.svg';
import penIcon from '@/assets/pen.svg';
import trashIcon from '@/assets/trash.svg';

import styles from './ExplorerFolder.module.css';

type Props = {
	folder: Folder;
	expand: boolean;
};

const ExplorerFolder = ({ folder, expand }: Props): ReactElement => {
	const tokenCookie = getCookie('token')?.toString() ?? '';

	const { addSuccess, addError } = useNotifications();
	const { selectedFolder, setSelectedFolder, newItemMode, setNewItemMode, newTitle, setNewTitle, handleNewItem } =
		useExplorer();

	const router = useRouter();

	// TODO refactor this out
	useEffect(() => {
		setOpen(expand);
	}, [expand]);

	const [open, setOpen] = useState(expand);
	const [edit, setEdit] = useState(false);
	const [folderTitle, setFolderTitle] = useState('');

	const handleEdit = (): void => {
		setEdit((old) => !old);
		setFolderTitle(folder.title);
	};

	const handleUpdate = async (): Promise<void> => {
		if (folderTitle === folder.title) return setEdit(false);

		try {
			await updateFolder(tokenCookie, folder.id, {
				title: folderTitle,
			});

			startTransition(() => router.refresh());

			addSuccess('successfully changed folder name');

			setEdit(false);
		} catch (err) {
			addError('failed to change folder name', err);
		}
	};

	const handleDelete = async (): Promise<void> => {
		try {
			await deleteFolder(tokenCookie, folder.id);

			addSuccess('successfully deleted folder');

			startTransition(() => router.refresh());
		} catch (err) {
			addError('failed to delete folder', err);
		}
	};

	const showNewItem = newItemMode && selectedFolder && selectedFolder.id === folder.id;

	return (
		<div>
			<div className={styles.content} onClick={() => setSelectedFolder(folder)}>
				<div className={styles.mainContent}>
					<Image
						onClick={() => setOpen((old) => !old)}
						className={clsx(styles.arrow, { [styles.arrowOpen]: open })}
						src={chevronIcon}
						width={15}
						height={15}
						alt="arrow icon"
					/>

					{!edit ? (
						<>
							<Image src={folderIcon} className={styles.edit} width={20} height={20} alt="folder icon" />
							<p>{folder.title}</p>
						</>
					) : (
						<ExplorerAddInput
							type="folder"
							value={folderTitle}
							onChange={(e) => setFolderTitle(e.target.value)}
							onSubmit={() => handleUpdate()}
							onBlur={() => setEdit(false)}
						/>
					)}
				</div>

				<div className={styles.options}>
					<Image className={styles.edit} src={penIcon} width={20} height={20} alt="pen icon" onClick={handleEdit} />

					<Tooltip
						items={[
							{
								label: 'Are you sure?',
								icon: 'alert',
								action: () => handleDelete(),
							},
						]}
					>
						<Image className={styles.edit} src={trashIcon} width={20} height={20} alt="delete icon" />
					</Tooltip>
				</div>
			</div>

			{/* TODO animations */}
			<div className={styles.items} style={{ display: open ? 'flex' : 'none' }}>
				{folder.subFolders &&
					folder.subFolders.map((subFolder) => {
						return 'parentFolderId' in subFolder ? (
							<ExplorerFolder folder={subFolder as Folder} key={subFolder.id} expand={expand} />
						) : 'content' in subFolder ? (
							<ExplorerNote note={subFolder as Note} key={subFolder.id} />
						) : (
							<ExplorerTodo todo={subFolder as Todo} key={subFolder.id} />
						);
					})}

				{(!folder.subFolders || folder.subFolders.length < 1) && <p className="small">no items</p>}
			</div>

			<div className={styles.addFolderContainer} style={{ display: showNewItem ? 'flex' : 'none' }}>
				{showNewItem && (
					<ExplorerAddInput
						type={newItemMode}
						value={newTitle}
						onChange={(e) => setNewTitle(e.target.value)}
						onSubmit={() => handleNewItem(tokenCookie)}
						onBlur={() => setNewItemMode(null)}
					/>
				)}
			</div>
		</div>
	);
};

export default ExplorerFolder;
