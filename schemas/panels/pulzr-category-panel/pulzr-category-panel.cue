package model

import (
	"github.com/perses/shared/cue/common"
)

kind: "PulzrCategoryPanel"
spec: close({
	display?: "bar" | "line" | "area" | "cells"
	format?:  common.#format
	// The color drawn in, any CSS color.
	color?: string & !=""
	// A column's or cell's opacity follows its value.
	intensity?: bool
	// A dashed line at the mean of the values.
	average?: bool
	// A dot on each value of a line or area.
	points?: bool
	// An area's fill opacity.
	areaOpacity?: number & >=0 & <=1
	// Columns at most this wide, in px; 0 lets them fill their category.
	maxBarWidth?: number & >=0
	// Columns standing up, or bars lying across with the names on the left.
	orientation?: "vertical" | "horizontal"
	// Each value written at the end of its column or bar.
	labels?: bool
	sort?:   "desc" | "asc"
	limit?:  int & >0
	xAxis?: close({
		label?: string
	})
	yAxis?: close({
		label?: string
		min?:   number
		max?:   number
	})
})
