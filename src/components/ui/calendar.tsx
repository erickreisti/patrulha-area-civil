"use client";

import * as React from "react";
import {
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "lucide-react";
import { DayButton, DayPicker, getDefaultClassNames } from "react-day-picker";

import { cn } from "@/utils/utils";
import { Button, buttonVariants } from "@/components/ui/button";

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  captionLayout = "label",
  buttonVariant = "ghost",
  formatters,
  components,
  ...props
}: React.ComponentProps<typeof DayPicker> & {
  buttonVariant?: React.ComponentProps<typeof Button>["variant"];
}) {
  const defaultClassNames = getDefaultClassNames();

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn(
        "bg-card/50 backdrop-blur-sm group/calendar p-3 [--cell-size:2rem] [[data-slot=card-content]_&]:bg-transparent [[data-slot=popover-content]_&]:bg-transparent",
        String.raw`rtl:**:[.rdp-button\_next>svg]:rotate-180`,
        String.raw`rtl:**:[.rdp-button\_previous>svg]:rotate-180`,
        className
      )}
      captionLayout={captionLayout}
      formatters={{
        formatMonthDropdown: (date) =>
          date.toLocaleDateString("default", { month: "short" }),
        ...formatters,
      }}
      classNames={{
        root: cn("w-fit", defaultClassNames.root),
        months: cn(
          "relative flex flex-col gap-4 md:flex-row",
          defaultClassNames.months
        ),
        month: cn("flex w-full flex-col gap-4", defaultClassNames.month),
        nav: cn(
          "absolute inset-x-0 top-0 flex w-full items-center justify-between gap-1",
          defaultClassNames.nav
        ),
        button_previous: cn(
          buttonVariants({ variant: buttonVariant }),
          "h-[--cell-size] w-[--cell-size] select-none p-0 aria-disabled:opacity-50 hover:bg-navy-100 hover:text-navy-700 dark:hover:bg-navy-800 dark:hover:text-navy-200",
          defaultClassNames.button_previous
        ),
        button_next: cn(
          buttonVariants({ variant: buttonVariant }),
          "h-[--cell-size] w-[--cell-size] select-none p-0 aria-disabled:opacity-50 hover:bg-navy-100 hover:text-navy-700 dark:hover:bg-navy-800 dark:hover:text-navy-200",
          defaultClassNames.button_next
        ),
        month_caption: cn(
          "flex h-[--cell-size] w-full items-center justify-center px-[--cell-size] text-navy-700 dark:text-navy-200",
          defaultClassNames.month_caption
        ),
        dropdowns: cn(
          "flex h-[--cell-size] w-full items-center justify-center gap-1.5 text-sm font-medium text-navy-700 dark:text-navy-200",
          defaultClassNames.dropdowns
        ),
        dropdown_root: cn(
          "has-focus:border-navy-400 has-focus:ring-navy-200 border border-input shadow-xs has-focus:ring-[3px] rounded-lg bg-white dark:bg-dark-secondary dark:border-divider-dark-medium",
          defaultClassNames.dropdown_root
        ),
        dropdown: cn(
          "absolute bg-popover dark:bg-dark-secondary inset-0 opacity-0",
          defaultClassNames.dropdown
        ),
        caption_label: cn(
          "select-none font-semibold text-navy-700 dark:text-navy-200",
          captionLayout === "label"
            ? "text-sm"
            : "rounded-lg pl-3 pr-2 flex items-center gap-2 text-sm [&>svg]:text-navy-400 [&>svg]:size-4",
          defaultClassNames.caption_label
        ),
        table: "w-full border-collapse",
        weekdays: cn("flex", defaultClassNames.weekdays),
        weekday: cn(
          "text-navy-600 dark:text-navy-300 flex-1 select-none rounded-md text-[0.8rem] font-medium py-2",
          defaultClassNames.weekday
        ),
        week: cn("flex w-full mt-2", defaultClassNames.week),
        week_number_header: cn(
          "w-[--cell-size] select-none",
          defaultClassNames.week_number_header
        ),
        week_number: cn(
          "text-navy-400 dark:text-navy-500 select-none text-[0.8rem]",
          defaultClassNames.week_number
        ),
        day: cn(
          "relative w-full h-full p-0 text-center [&:last-child[data-selected=true]_button]:rounded-r-md group/day aspect-square select-none",
          props.showWeekNumber
            ? "[&:nth-child(2)[data-selected=true]_button]:rounded-l-md"
            : "[&:first-child[data-selected=true]_button]:rounded-l-md",
          defaultClassNames.day
        ),
        range_start: cn(
          "bg-navy-600 text-white rounded-l-md",
          defaultClassNames.range_start
        ),
        range_middle: cn(
          "bg-navy-100 text-navy-800 dark:bg-navy-800 dark:text-navy-200 rounded-none",
          defaultClassNames.range_middle
        ),
        range_end: cn(
          "bg-navy-600 text-white rounded-r-md",
          defaultClassNames.range_end
        ),
        today: cn(
          "bg-navy-50 text-navy-900 dark:bg-navy-800 dark:text-navy-50 rounded-md",
          defaultClassNames.today
        ),
        outside: cn(
          "text-slate-400 dark:text-slate-500 aria-selected:text-slate-400",
          defaultClassNames.outside
        ),
        disabled: cn(
          "text-slate-300 dark:text-slate-600 opacity-50",
          defaultClassNames.disabled
        ),
        hidden: cn("invisible", defaultClassNames.hidden),
        ...classNames,
      }}
      components={{
        Root: ({ className, rootRef, ...props }) => {
          return (
            <div
              data-slot="calendar"
              ref={rootRef}
              className={cn(className)}
              {...props}
            />
          );
        },
        Chevron: ({ className, orientation, ...props }) => {
          if (orientation === "left") {
            return (
              <ChevronLeftIcon
                className={cn(
                  "size-4 text-navy-600 dark:text-navy-300",
                  className
                )}
                {...props}
              />
            );
          }

          if (orientation === "right") {
            return (
              <ChevronRightIcon
                className={cn(
                  "size-4 text-navy-600 dark:text-navy-300",
                  className
                )}
                {...props}
              />
            );
          }

          return (
            <ChevronDownIcon
              className={cn(
                "size-4 text-navy-600 dark:text-navy-300",
                className
              )}
              {...props}
            />
          );
        },
        DayButton: CalendarDayButton,
        WeekNumber: ({ children, ...props }) => {
          return (
            <td {...props}>
              <div className="flex size-[--cell-size] items-center justify-center text-center font-medium text-navy-500 dark:text-navy-400">
                {children}
              </div>
            </td>
          );
        },
        ...components,
      }}
      {...props}
    />
  );
}

function CalendarDayButton({
  className,
  day,
  modifiers,
  ...props
}: React.ComponentProps<typeof DayButton>) {
  const defaultClassNames = getDefaultClassNames();

  const ref = React.useRef<HTMLButtonElement>(null);
  React.useEffect(() => {
    if (modifiers.focused) ref.current?.focus();
  }, [modifiers.focused]);

  const isToday = modifiers.today;
  const isSelected = modifiers.selected;
  const isOutside = modifiers.outside;

  // CORREÇÃO: Acessar a propriedade 'date' do objeto 'day'
  const dayNumber = day.date.getDate();
  const dayDate = day.date;

  return (
    <Button
      ref={ref}
      variant="ghost"
      size="icon"
      data-day={dayDate.toLocaleDateString()}
      data-selected-single={
        modifiers.selected &&
        !modifiers.range_start &&
        !modifiers.range_end &&
        !modifiers.range_middle
      }
      data-range-start={modifiers.range_start}
      data-range-end={modifiers.range_end}
      data-range-middle={modifiers.range_middle}
      className={cn(
        "relative group/button data-[selected-single=true]:bg-navy-600 data-[selected-single=true]:text-white data-[selected-single=true]:shadow-md data-[range-middle=true]:bg-navy-100 data-[range-middle=true]:text-navy-800 data-[range-middle=true]:dark:bg-navy-800 data-[range-middle=true]:dark:text-navy-200 data-[range-start=true]:bg-navy-600 data-[range-start=true]:text-white data-[range-end=true]:bg-navy-600 data-[range-end=true]:text-white hover:bg-navy-50 hover:text-navy-700 dark:hover:bg-navy-800/50 dark:hover:text-navy-200 flex aspect-square h-auto w-full min-w-[--cell-size] flex-col gap-1 leading-none font-normal group-data-[focused=true]/day:border-navy-300 group-data-[focused=true]/day:ring-navy-100 dark:group-data-[focused=true]/day:border-navy-600 dark:group-data-[focused=true]/day:ring-navy-900/50 group-data-[focused=true]/day:relative group-data-[focused=true]/day:z-10 group-data-[focused=true]/day:ring-[3px] data-[range-end=true]:rounded-md data-[range-end=true]:rounded-r-md data-[range-middle=true]:rounded-none data-[range-start=true]:rounded-md data-[range-start=true]:rounded-l-md [&>span]:text-xs [&>span]:opacity-80",
        isToday &&
          !isSelected &&
          "bg-navy-50 text-navy-900 dark:bg-navy-800 dark:text-navy-50",
        isOutside && "opacity-50 hover:opacity-70",
        defaultClassNames.day,
        className
      )}
      {...props}
    >
      <span className="relative z-10">{dayNumber}</span>

      {/* Indicador de data atual (ponto inferior) */}
      {isToday && !isSelected && (
        <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 rounded-full bg-navy-500 dark:bg-navy-400"></div>
      )}
    </Button>
  );
}

export { Calendar, CalendarDayButton };
