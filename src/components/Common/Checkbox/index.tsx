type CheckboxProps = {
  selected: boolean | undefined;
  handleOnchange?: () => void;
  id?: string;
};

const Checkbox = ({ selected, handleOnchange, id }: CheckboxProps) => {
  return (
    <input
      type="checkbox"
      checked={selected}
      onChange={handleOnchange}
      id={id}
    />
  );
};
export default Checkbox;
