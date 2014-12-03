/**
 * Created by willhu on 2014/12/01
 */
//require.config({
//	baseUrl: "../js/",
//	paths : {
//		"jquery" : ["http://libs.baidu.com/jquery/2.0.3/jquery", "/lib/jquery-1.11.1"],
//		"a": ["lib/a"]
//	}
//});
//require(["jquery", "a"],function($, a) {
//	$(function() {
//		alert(a)
//	});
//});

;(function($) {
	$.extend({
		wwSlide: {
			// 激活的slide
			activeSlide: null,
			// 激活的动画
			activeAnimate: null,
			// 全部幻灯片
			arraySlide: [],
			// 全部含动画的部件 （即有些段落会有淡入淡出的动画）
			arrayAnimate: [],
			// 幻灯片索引
			indexSlide: 0,
			// 动画部件索引
			indexAnimate: 0,
			arrayTools: ["Home","Remind","Background","Previous", "Next","List","Help"],
			// 本地存储时间提醒
			timeLocalstorageKey: location.href.split("#")[0] + "wwTime",
			bgLocalstorageKey: location.href.split("#")[0] + "wwBg",

			// slide 显隐 两个参数，一个参数是当前slide 一个是参数是目标slide
			visible: function(activeSlide, targetSlide) {
				// 如果有当前slide,则去除class
				if(activeSlide) {
					activeSlide.removeClass("ww-slide-curr");
				}
				// 动画时间400ms
				setTimeout(function() {
					//改变url地址栏的快速锚点
					location.replace(location.href.split("#")[0] + "#" + targetSlide.attr("id"));
				}, 400);

				// 当前激活slide变为之前目标slide
				targetSlide.addClass("ww-slide-curr").trigger("slideload");
				this.activeSlide = targetSlide;
				// 当前激活slide的index变为目标slide的index
				this.indexSlide = targetSlide.data("indexSlide");
				// 触发进度条事件
				this.process();
				return this;
			},
			process: function() {
				var nowSlide = this.indexSlide + 1,
					totalSlide = this.arraySlide.length;
				if(nowSlide === totalSlide) {
					$(".ww-silde-progress").html("&nbsp;").width("100%");
				} else {
					$(".ww-silde-progress").html(nowSlide).width(nowSlide / totalSlide * 100 + "%");
				}
			},
			group: function() {
				// 把slide和动画部件放入数组中
				var arraySlide = [],
					arrayAnimate = [],
					indexAnimate = 0;
				// 所有slide部分
				var eleSlide = $("div[data-role='slide']");
				eleSlide.each(function(indexSlide) {
					$(this).data("index", indexAnimate);
					arrayAnimate.push($(this));
					$(this).data("indexSlide", indexSlide);
					arraySlide.push($(this));
					indexAnimate++;
					var eleFade = $(this).find("[data-role='fade']");
					eleFade.each(function() {
						$(this).data("index", indexAnimate);
						arrayAnimate.push($(this));
						indexAnimate++;
					});
				});

				this.arraySlide = arraySlide;
				this.arrayAnimate = arrayAnimate;
				return this
			},
			initIndex: function() {
				// 根据URL获取slide索引值
				var targetId = location.href.split("#")[1];
				if (targetId) {
					var targetElement = $("#" + targetId);
				}
				// 如果锚点不存在，或锚点对应元素不存在，index=0
				if (targetElement && targetElement.length) {
					this.indexSlide = targetElement.data("indexSlide") || 0;
					this.indexAnimate = targetElement.data("index") || 0;
				} else {
					this.indexSlide = 0;
					this.indexAnimate = 0;
				}
				return this;
			},
			// 切换
			slide: function() {
				debugger;
				// 动画个页面的切换主要由 indexAnimate决定
				var eleBeingAnimate = this.arrayAnimate[this.indexAnimate];
				if (eleBeingAnimate) {
					var roleBeingAnimate = eleBeingAnimate.attr("data-role");
				};
				// 上一页下一页  当前活动页面和动画的索引
				var elePrevSlide = this.arraySlide[this.indexSlide - 1],
					eleNextSlide = this.arraySlide[this.indexSlide + 1],
					// 默认index为-1
					indexActiveSlide = -1,
					indexActiveAnimate = -1;

				if (this.activeSlide) {
					// 当前显示page的index
					indexActiveSlide = this.activeSlide.data("index");
				};
				if (this.activeAnimate) {
					// 当前动画的index
					indexActiveAnimate = this.activeAnimate.data("index")
				}

				if (roleBeingAnimate === "fade") {
					if(this.indexAnimate < indexActiveAnimate) {
						// 当前页离开
						this.activeSlide.removeClass("in").addClass("out reverse");
						// 目标页进入
						elePrevSlide.removeClass("out").addClass("in reverse");
						// 显示目标元素
						this.visible(this.activeSlide,elePrevSlide);
						elePrevSlide.find("[data-role='fade']").removeClass("out").addClass("in");
					} else {
						if (this.indexAnimate > indexActiveAnimate) {
							eleBeingAnimate.removeClass("out").addClass("in");
						} else {
							this.activeAnimate.removeClass("in").addClass("out");
						}
					}
				} else if (roleBeingAnimate === "slide") {
					if (!this.activeSlide) {
						// 此时为直接载入的情况
						//eleBeingAnimate.addClass("in")
					} else if (this.indexAnimate > indexActiveSlide) {
						// 即将展示页的索引大于当前页的索引，前进
						// 当前页左边移出
						this.activeSlide.removeClass("in reverse").addClass("out");
						// 即将展示页面右边进入
						eleBeingAnimate.removeClass("out reverse").addClass("in");
					} else if (this.indexAnimate < indexActiveSlide) {
						// 即将展示页的索引小于当前页的索引，后退
						// 当前页右边移出
						this.activeSlide.removeClass("in").addClass("out reverse");
						// 即将展示页左侧进入
						eleBeingAnimate.removeClass("out").addClass("in reverse");
					}

					eleBeingAnimate.find("[data-role='fade']").removeClass("in out");
					this.visible(this.activeSlide, eleBeingAnimate);
				}
				this.activeAnimate = eleBeingAnimate;

				return this;
			},
			// 事件
			events: function() {
				var indexAnimate = this.indexAnimate,
					arrayAnimate = this.arrayAnimate,
					self = this;
				var funIndexAnimate = function() {
					if (indexAnimate >= arrayAnimate.length) {
						indexAnimate = arrayAnimate.length -1;
						alert("主人，已经播放完毕了！");
					} else if (indexAnimate < 0) {
						indexAnimate = 0;
						alert("主人，前面已经没有了！");
					} else {
						alert("sdadasd")
						self.indexAnimate = indexAnimate;
						self.slide();
					}
				};
				// 键盘事件
				$(document).bind({
					"keyup": function(event) {
						var keyCode = event.keyCode;
						//alert(keyCode)
						// 下一页
						if (keyCode === 39) {
							event.preventDefault();
							self.slide();
						} else if (keyCode === 37) {
							event.preventDefault();
							self.slide();
						}
					}
				});
				return this;
			},

			//初始化
			init: function() {
				this.group().initIndex().events().slide()
			}

		}
	})
})(jQuery);