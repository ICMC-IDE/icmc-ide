import CharMap from "./resources/charmap.js";

export default class Renderer {
  #canvas;
  #gl;
  #charmap: CharMap | null = null;
  #cols;
  #lines;
  #quadVao;
  #quadVbo;
  #charsVbo;
  #charmapTex;
  #shaderProgram;

  constructor(
    canvas: HTMLCanvasElement,
    charmap: CharMap,
    cols: number,
    lines: number,
  ) {
    this.#canvas = canvas;
    this.#cols = cols;
    this.#lines = lines;

    const gl = canvas.getContext("webgl2")!;
    this.#gl = gl;

    const vertShaderSrc = `#version 300 es

      layout (location = 0) in vec4 vertex;
      layout (location = 1) in uvec2 char;

      out vec2 texel;

      uniform uint line_cells;
      uniform uvec2 char_res;
      uniform mat4 projection;

      void main(void) {
        uvec2 pos = uvec2(uint(gl_InstanceID) % line_cells, uint(gl_InstanceID) / line_cells);
        gl_Position = projection * vec4(vertex.xy + vec2(pos * char_res), 0.0f, 1.0f);

        texel = vec2(char.yx * char_res) + (vertex.zw * vec2(char_res));
      }`;

    const fragShaderSrc = `#version 300 es

      in lowp vec2 texel;

      out lowp vec4 color;

      uniform sampler2D tex;

      void main(void) {
        color = texelFetch(tex, ivec2(texel), 0);
      }`;

    const vertShader = this.#shaderCompile(gl.VERTEX_SHADER, vertShaderSrc)!;
    const fragShader = this.#shaderCompile(gl.FRAGMENT_SHADER, fragShaderSrc)!;
    if (!vertShader || !fragShader) {
      return;
    }
    const shaderProgram = this.#shaderLink(vertShader, fragShader)!;
    if (!shaderProgram) {
      return;
    }
    this.#shaderProgram = shaderProgram!;

    const quadVao = gl.createVertexArray();
    gl.bindVertexArray(quadVao);
    this.#quadVao = quadVao;

    const quadVbo = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, quadVbo);
    const vertexAttrib = gl.getAttribLocation(shaderProgram, "vertex");
    gl.enableVertexAttribArray(vertexAttrib);
    gl.vertexAttribPointer(vertexAttrib, 4, gl.FLOAT, false, 0, 0);
    this.#quadVbo = quadVbo;

    const charsVbo = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, charsVbo);
    const charAttrib = gl.getAttribLocation(shaderProgram, "char");
    gl.enableVertexAttribArray(charAttrib);
    gl.vertexAttribIPointer(charAttrib, 2, gl.UNSIGNED_BYTE, 0, 0);
    gl.vertexAttribDivisor(charAttrib, 1);
    this.#charsVbo = charsVbo;

    const charmapTex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, charmapTex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    this.#charmapTex = charmapTex;

    this.#setCharmap(charmap);
  }

  render(memory: Uint16Array) {
    const gl = this.#gl;

    gl.useProgram(this.#shaderProgram!);
    gl.bindTexture(gl.TEXTURE_2D, this.#charmapTex!);
    gl.uniform1i(gl.getUniformLocation(this.#shaderProgram!, "tex"), 0);
    gl.uniform1ui(
      gl.getUniformLocation(this.#shaderProgram!, "line_cells"),
      this.#cols,
    );

    gl.bindVertexArray(this.#quadVao!);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.#charsVbo!);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Uint8Array(memory.buffer, memory.byteOffset),
      gl.STATIC_DRAW,
    );

    gl.drawArraysInstanced(gl.TRIANGLES, 0, 6, this.#cols * this.#lines);
  }

  clear() {
    const gl = this.#gl;

    gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);
  }

  resize(cols: number, lines: number) {
    this.#cols = cols;
    this.#lines = lines;

    const gl = this.#gl;

    const width = cols * this.#charmap!.charWidth;
    const height = lines * this.#charmap!.charHeight;

    gl.viewport(0, 0, width, height);
    this.#canvas.width = width;
    this.#canvas.height = height;
    this.#setOrtho(width, height);
  }

  get charmap() {
    return this.#charmap!;
  }

  set charmap(value: CharMap) {
    this.#setCharmap(value);
  }

  #setCharmap(charmap: CharMap) {
    console.log(charmap.data);
    const gl = this.#gl;

    gl.bindTexture(gl.TEXTURE_2D, this.#charmapTex!);
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGBA,
      charmap.width,
      charmap.height,
      0,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      charmap.data,
    );

    if (
      !this.#charmap ||
      charmap.charWidth != this.#charmap.charWidth ||
      charmap.charHeight != this.#charmap.charHeight
    ) {
      this.#charmap = charmap;
      this.#setQuad(charmap.charWidth, charmap.charHeight);
      return this.resize(this.#cols, this.#lines);
    }
    this.#charmap = charmap;
  }

  #setOrtho(width: number, height: number) {
    const gl = this.#gl;

    gl.useProgram(this.#shaderProgram!);
    gl.uniformMatrix4fv(
      gl.getUniformLocation(this.#shaderProgram!, "projection"),
      false,
      [
        2 / width,
        0,
        0,
        0,
        0,
        -2 / height,
        0,
        0,
        0,
        0,
        2 / 1000,
        0,
        -1,
        1,
        0,
        1,
      ],
    );
  }

  #setQuad(width: number, height: number) {
    const gl = this.#gl;

    gl.bindVertexArray(this.#quadVao!);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.#quadVbo!);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([
        0,
        height,
        0,
        1,
        0,
        0,
        0,
        0,
        width,
        0,
        1,
        0,
        0,
        height,
        0,
        1,
        width,
        0,
        1,
        0,
        width,
        height,
        1,
        1,
      ]),
      gl.STATIC_DRAW,
    );

    gl.useProgram(this.#shaderProgram!);
    gl.uniform2ui(
      gl.getUniformLocation(this.#shaderProgram!, "char_res"),
      width,
      height,
    );
  }

  #shaderLink(vertShader: WebGLShader, fragShader: WebGLShader) {
    const gl = this.#gl;

    const program = gl.createProgram()!;
    gl.attachShader(program, vertShader);
    gl.attachShader(program, fragShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error(
        "Error: shader program linking failed: ",
        gl.getProgramInfoLog(program),
      );
      return null;
    }
    return program;
  }

  #shaderCompile(type: number, source: string) {
    const gl = this.#gl;

    const shader = gl.createShader(type)!;
    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.error(
        "Error: shader compilation failed: ",
        gl.getShaderInfoLog(shader),
      );
      return null;
    }
    return shader;
  }
}
