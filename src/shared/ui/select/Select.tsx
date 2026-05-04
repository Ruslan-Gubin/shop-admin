import styles from "./Select.module.css";

type Props = {
  label: string;
  options: { label: string; value: string }[];
  defaultValue: string;
  selectKey: string;
  selectName: string;
  selectId: string;
  error: string;
};

export const Select = (props: Props) => {
  return (
    <div className={styles.selectWrapper}>
      <label htmlFor="apply_to" className={styles.selectLabel}>
        {props.label}
      </label>
      <select
        key={props.selectKey}
        defaultValue={props.defaultValue}
        name={props.selectName}
        id={props.selectId}
        className={styles.select}
      >
        {props.options.map((item) => (
          <option key={item.label} value={item.value}>
            {item.label}
          </option>
        ))}
      </select>
      {props.error && <span className={styles.selectError}>{props.error}</span>}
    </div>
  );
};
