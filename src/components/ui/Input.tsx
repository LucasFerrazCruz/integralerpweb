type InputProps = {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
};

export default function Input({ value, onChange, placeholder }: InputProps) {
  return (
    <input
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      style={{
        padding: 8,
        border: "1px solid #ccc",
        borderRadius: 4,
      }}
    />
  );
}
