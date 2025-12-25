export function H1(
  props: React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLHeadingElement>,
    HTMLHeadingElement
  >
) {
  return (
    <h1
      {...props}
      className="scroll-m-20 text-center text-4xl font-extrabold tracking-tight text-balance"
    />
  );
}

export function H2(
  props: React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLHeadingElement>,
    HTMLHeadingElement
  >
) {
  return (
    <h2
      {...props}
      className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0"
    />
  );
}

export function H3(
  props: React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLHeadingElement>,
    HTMLHeadingElement
  >
) {
  return (
    <h3
      {...props}
      className="scroll-m-20 text-2xl font-semibold tracking-tight"
    />
  );
}
export function H4(
  props: React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLHeadingElement>,
    HTMLHeadingElement
  >
) {
  return (
    <h4
      {...props}
      className="scroll-m-20 text-xl font-semibold tracking-tight"
    />
  );
}
export function P(
  props: React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLParagraphElement>,
    HTMLParagraphElement
  >
) {
  return <p {...props} className="leading-7 not-first:mt-6" />;
}
export function Blockquote(
  props: React.DetailedHTMLProps<
    React.BlockquoteHTMLAttributes<HTMLQuoteElement>,
    HTMLQuoteElement
  >
) {
  return <blockquote {...props} className="mt-6 border-l-2 pl-6 italic" />;
}
export function InlineCode(
  props: React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>
) {
  return (
    <code
      {...props}
      className="bg-muted relative rounded px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold"
    />
  );
}
export function Lead(
  props: React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLParagraphElement>,
    HTMLParagraphElement
  >
) {
  return <p {...props} className="text-muted-foreground text-xl" />;
}
export function Large(
  props: React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
  >
) {
  return <div {...props} className="text-lg font-semibold" />;
}
export function Small(
  props: React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>
) {
  return <small {...props} className="text-sm leading-none font-medium" />;
}
export function Muted(
  props: React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLParagraphElement>,
    HTMLParagraphElement
  >
) {
  return <p {...props} className="text-muted-foreground text-sm" />;
}
