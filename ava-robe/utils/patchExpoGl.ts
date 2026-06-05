const UNPACK_FLIP_Y_WEBGL = 0x9240;
const UNPACK_PREMULTIPLY_ALPHA_WEBGL = 0x9241;
const UNPACK_COLORSPACE_CONVERSION_WEBGL = 0x9243;

const UNSUPPORTED_PARAMS = new Set<number>([UNPACK_FLIP_Y_WEBGL, UNPACK_PREMULTIPLY_ALPHA_WEBGL, UNPACK_COLORSPACE_CONVERSION_WEBGL]);

export function patchExpoGl(gl: any) {
	if (!gl || gl.__pixelStoreiPatched) return;

	const origPixelStorei = gl.pixelStorei.bind(gl);
	gl.pixelStorei = function (pname: number, param: number) {
		if (UNSUPPORTED_PARAMS.has(pname)) return;
		return origPixelStorei(pname, param);
	};
	gl.__pixelStoreiPatched = true;
}
