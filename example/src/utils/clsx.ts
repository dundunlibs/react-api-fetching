export default function clsx(...classnames: string[]) {
  return classnames.filter(Boolean).join(" ")
}