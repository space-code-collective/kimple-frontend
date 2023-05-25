import { ReactElement, ChangeEvent } from 'react';
import styles from './InputField.module.css';

type Props = {
	type: 'text' | 'email' | 'password';
	value: string;
	name?: string;
	placeholder?: string;
	autoFocus?: boolean;
	onChange?: (v: ChangeEvent<HTMLInputElement>) => void;
	onBlur?: (v: ChangeEvent<HTMLInputElement>) => void;
	className?: string;
};

const InputField = ({ type, value, name, placeholder, autoFocus, onChange, onBlur }: Props): ReactElement => {
	return (
		<input
			className={styles.input}
			name={name}
			type={type}
			value={value}
			placeholder={placeholder}
			autoFocus={autoFocus}
			onChange={onChange}
			onBlur={onBlur}
		/>
	);
};

export default InputField;